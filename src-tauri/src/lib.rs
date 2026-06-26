use regex::Regex;
use serde::{Deserialize, Serialize};
use std::{
    env,
    fs,
    path::{Path, PathBuf},
    process::Command,
    time::{SystemTime, UNIX_EPOCH},
};

#[derive(Debug, Serialize)]
struct CommandProbe {
    id: String,
    label: String,
    command: String,
    detected: bool,
    exit_code: Option<i32>,
    output: String,
    path: Option<String>,
    message: String,
}

#[derive(Debug, Serialize)]
struct ConfigFileStatus {
    id: String,
    label: String,
    path: String,
    exists: bool,
    redacted_preview: Option<String>,
}

#[derive(Debug, Serialize)]
struct LocalSkill {
    name: String,
    description: String,
    source_path: String,
    category_hint: String,
}

#[derive(Debug, Deserialize)]
struct DownloadPlanRequest {
    selected_targets: Vec<String>,
    china_mirror_first: bool,
    offline_cache_path: String,
}

#[derive(Debug, Serialize)]
struct DownloadPlanItem {
    id: String,
    label: String,
    source: String,
    fallback: String,
    target_path: String,
    notes: String,
}

#[derive(Debug, Deserialize)]
struct ConfigPreviewRequest {
    initialize_codex: bool,
    initialize_claude: bool,
    initialize_skills: bool,
    initialize_dialogue: bool,
}

#[derive(Debug, Serialize)]
struct ConfigPreviewItem {
    path: String,
    action: String,
    risk: String,
}

#[derive(Debug, Deserialize)]
struct DiagnosticExportRequest {
    content: String,
}

#[derive(Debug, Serialize)]
struct DiagnosticExportResult {
    path: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct ProviderConfig {
    id: String,
    display_name: String,
    protocol: String,
    base_url: String,
    api_key: String,
    selected_model: Option<String>,
    applies_to: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct ApplyConfigurationRequest {
    providers: Vec<ProviderConfig>,
    skill_index_markdown: String,
    dialogue_markdown: String,
    initialize_codex: bool,
    initialize_claude: bool,
    initialize_skills: bool,
    initialize_dialogue: bool,
}

#[derive(Debug, Serialize)]
struct WriteResult {
    id: String,
    path: String,
    backup_path: Option<String>,
    bytes: usize,
    message: String,
}

#[derive(Debug, Deserialize)]
struct InstallRecipeRequest {
    id: String,
    china_mirror_first: bool,
}

#[derive(Debug, Serialize)]
struct InstallRecipeResult {
    id: String,
    command: String,
    success: bool,
    exit_code: Option<i32>,
    output: String,
    message: String,
}

fn run_shell_command(command: &str) -> (bool, Option<i32>, String) {
    let output = Command::new("cmd").args(["/C", command]).output();

    match output {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
            let combined = [stdout, stderr]
                .into_iter()
                .filter(|part| !part.is_empty())
                .collect::<Vec<_>>()
                .join("\n");
            (output.status.success(), output.status.code(), redact_secrets(&combined))
        }
        Err(error) => (false, None, format!("无法执行检测命令：{error}")),
    }
}

fn install_recipe_command(id: &str, china_mirror_first: bool) -> Result<String, String> {
    let npm_registry = if china_mirror_first {
        " --registry=https://registry.npmmirror.com"
    } else {
        ""
    };

    let command = match id {
        "python" => "winget install -e --id Python.Python.3.11 --silent --accept-package-agreements --accept-source-agreements".to_string(),
        "node" => "winget install -e --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements".to_string(),
        "git" => "winget install -e --id Git.Git --silent --accept-package-agreements --accept-source-agreements".to_string(),
        "powershell" => "winget install -e --id Microsoft.PowerShell --silent --accept-package-agreements --accept-source-agreements".to_string(),
        "codex-cli" => format!("npm.cmd install -g @openai/codex{npm_registry}"),
        "claude-cli" => format!("npm.cmd install -g @anthropic-ai/claude-code{npm_registry}"),
        "codex-plus-plus" => [
            "powershell -NoProfile -ExecutionPolicy Bypass -Command",
            "\"$release=Invoke-RestMethod https://api.github.com/repos/BigPizzaV3/CodexPlusPlus/releases/latest;",
            "$asset=$release.assets | Where-Object { $_.name -match 'windows-x64-setup\\\\.exe$' } | Select-Object -First 1;",
            "if(-not $asset){ throw 'Codex++ Windows x64 installer asset not found' };",
            "$out=Join-Path $env:TEMP $asset.name;",
            "Invoke-WebRequest $asset.browser_download_url -OutFile $out;",
            "Start-Process $out -Wait\"",
        ].join(" "),
        "cc-switch" => [
            "powershell -NoProfile -ExecutionPolicy Bypass -Command",
            "\"$release=Invoke-RestMethod https://api.github.com/repos/farion1231/cc-switch/releases/latest;",
            "$asset=$release.assets | Where-Object { $_.name -match 'Windows\\\\.msi$' } | Select-Object -First 1;",
            "if(-not $asset){ throw 'CC Switch Windows MSI asset not found' };",
            "$out=Join-Path $env:TEMP $asset.name;",
            "Invoke-WebRequest $asset.browser_download_url -OutFile $out;",
            "Start-Process msiexec.exe -ArgumentList '/i', $out, '/passive' -Wait\"",
        ].join(" "),
        "codex-desktop" => "start https://openai.com/codex/".to_string(),
        "claude-desktop" => "start https://claude.ai/download".to_string(),
        unsupported => return Err(format!("No whitelisted install recipe exists for {unsupported}")),
    };

    Ok(command)
}

fn first_successful_probe(id: &str, label: &str, commands: &[&str]) -> CommandProbe {
    let mut last_probe = None;

    for command in commands {
        let (detected, exit_code, output) = run_shell_command(command);
        let probe = CommandProbe {
            id: id.to_string(),
            label: label.to_string(),
            command: (*command).to_string(),
            detected,
            exit_code,
            path: find_binary_path(id),
            message: if detected {
                "已检测到可用组件。".to_string()
            } else {
                "未检测到，或命令返回非零退出码。".to_string()
            },
            output,
        };

        if detected {
            return probe;
        }

        last_probe = Some(probe);
    }

    last_probe.unwrap_or_else(|| CommandProbe {
        id: id.to_string(),
        label: label.to_string(),
        command: String::new(),
        detected: false,
        exit_code: None,
        output: String::new(),
        path: None,
        message: "未配置检测命令。".to_string(),
    })
}

fn find_binary_path(id: &str) -> Option<String> {
    let binary = match id {
        "python" => "python",
        "node" => "node",
        "git" => "git",
        "powershell" => "pwsh",
        "codex-cli" => "codex",
        "claude-cli" => "claude",
        "github-cli" => "gh",
        "sevenzip" => "7z",
        "winget" => "winget",
        _ => return None,
    };

    let (success, _, output) = run_shell_command(&format!("where {binary}"));
    success.then_some(output.lines().next().unwrap_or_default().to_string())
}

fn user_path(parts: &[&str]) -> PathBuf {
    let base = env::var("USERPROFILE").unwrap_or_else(|_| ".".to_string());
    parts.iter().fold(PathBuf::from(base), |path, part| path.join(part))
}

fn app_data_path(parts: &[&str]) -> PathBuf {
    let base = env::var("APPDATA").unwrap_or_else(|_| user_path(&[]).join("AppData\\Roaming").display().to_string());
    parts.iter().fold(PathBuf::from(base), |path, part| path.join(part))
}

fn local_app_data_path(parts: &[&str]) -> PathBuf {
    let base = env::var("LOCALAPPDATA").unwrap_or_else(|_| user_path(&[]).join("AppData\\Local").display().to_string());
    parts.iter().fold(PathBuf::from(base), |path, part| path.join(part))
}

fn unix_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

fn ensure_allowed_path(path: &Path) -> Result<(), String> {
    let allowed_roots = [user_path(&[]), app_data_path(&[]), local_app_data_path(&[])];
    let absolute = if path.is_absolute() {
        path.to_path_buf()
    } else {
        env::current_dir()
            .map_err(|error| error.to_string())?
            .join(path)
    };

    if allowed_roots.iter().any(|root| absolute.starts_with(root)) {
        Ok(())
    } else {
        Err(format!("Refusing to write outside user-owned configuration directories: {}", path.display()))
    }
}

fn write_with_backup(id: &str, path: PathBuf, content: &str) -> Result<WriteResult, String> {
    ensure_allowed_path(&path)?;

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }

    let backup_path = if path.exists() {
        let backup = path.with_extension(format!(
            "{}.bak.{}",
            path.extension()
                .and_then(|extension| extension.to_str())
                .unwrap_or("backup"),
            unix_timestamp()
        ));
        fs::copy(&path, &backup).map_err(|error| error.to_string())?;
        Some(backup)
    } else {
        None
    };

    let temp_path = path.with_extension(format!(
        "{}.tmp.{}",
        path.extension()
            .and_then(|extension| extension.to_str())
            .unwrap_or("tmp"),
        unix_timestamp()
    ));
    fs::write(&temp_path, content).map_err(|error| error.to_string())?;

    if path.exists() {
        fs::remove_file(&path).map_err(|error| error.to_string())?;
    }

    fs::rename(&temp_path, &path).map_err(|error| error.to_string())?;

    Ok(WriteResult {
        id: id.to_string(),
        path: path.display().to_string(),
        backup_path: backup_path.map(|backup| backup.display().to_string()),
        bytes: content.as_bytes().len(),
        message: "写入完成，原文件已按需备份。".to_string(),
    })
}

fn providers_for_app(providers: &[ProviderConfig], app: &str) -> Vec<ProviderConfig> {
    providers
        .iter()
        .filter(|provider| provider.applies_to.iter().any(|target| target == app))
        .map(|provider| ProviderConfig {
            id: provider.id.clone(),
            display_name: provider.display_name.clone(),
            protocol: provider.protocol.clone(),
            base_url: provider.base_url.clone(),
            api_key: provider.api_key.clone(),
            selected_model: provider.selected_model.clone(),
            applies_to: provider.applies_to.clone(),
        })
        .collect()
}

fn provider_json(app: &str, providers: Vec<ProviderConfig>) -> Result<String, String> {
    let value = serde_json::json!({
        "generatedBy": "Codex+Claude Assistant",
        "generatedAt": unix_timestamp(),
        "app": app,
        "warning": "This file may contain local API keys if the user chose to initialize providers. Do not upload it.",
        "providers": providers,
    });

    serde_json::to_string_pretty(&value).map_err(|error| error.to_string())
}

fn read_redacted_preview(path: &Path) -> Option<String> {
    if !path.exists() {
        return None;
    }

    let content = fs::read_to_string(path).ok()?;
    let preview = content.lines().take(40).collect::<Vec<_>>().join("\n");
    Some(redact_secrets(&preview))
}

fn redact_secrets(input: &str) -> String {
    let patterns = [
        r"github_pat_[A-Za-z0-9_]+",
        r"ghp_[A-Za-z0-9_]+",
        r"cfat_[A-Za-z0-9_-]+",
        r"sk-[A-Za-z0-9_-]{10,}",
        r"LTAI[A-Za-z0-9]+",
        r"AKIA[A-Za-z0-9]+",
        r#"(?i)(api[_-]?key|token|secret|password|access[_-]?key|secret[_-]?key)(["'\s:=]+)([^"',\s}]+)"#,
    ];

    patterns.iter().fold(input.to_string(), |text, pattern| {
        let regex = Regex::new(pattern).expect("valid redaction regex");
        regex
            .replace_all(&text, |captures: &regex::Captures| {
                if captures.len() >= 4 {
                    format!("{}{}<REDACTED>", &captures[1], &captures[2])
                } else {
                    "<REDACTED>".to_string()
                }
            })
            .to_string()
    })
}

fn parse_skill_file(path: &Path) -> Option<LocalSkill> {
    let content = fs::read_to_string(path).ok()?;
    let mut name = path.parent()?.file_name()?.to_string_lossy().to_string();
    let mut description = String::new();

    for line in content.lines().take(80) {
        if let Some(value) = line.strip_prefix("name:") {
            name = value.trim().trim_matches('"').to_string();
        }

        if let Some(value) = line.strip_prefix("description:") {
            description = value.trim().trim_matches('"').to_string();
        }
    }

    Some(LocalSkill {
        category_hint: infer_skill_category(&name, &description),
        name,
        description,
        source_path: path.display().to_string(),
    })
}

fn infer_skill_category(name: &str, description: &str) -> String {
    let text = format!("{name} {description}").to_lowercase();

    if text.contains("design") || text.contains("ui") || text.contains("ux") || text.contains("accessibility") {
        "UI、UX、产品设计".to_string()
    } else if text.contains("browser") || text.contains("cli") || text.contains("automation") || text.contains("desktop") {
        "CLI、浏览器、桌面自动化".to_string()
    } else if text.contains("agent") || text.contains("eval") || text.contains("workflow") {
        "Agent 编排与评估".to_string()
    } else if text.contains("skill") || text.contains("plugin") || text.contains("mcp") {
        "Skill、插件、MCP 管理".to_string()
    } else if text.contains("code") || text.contains("api") || text.contains("testing") || text.contains("rust") {
        "编码、框架、测试".to_string()
    } else if text.contains("cloud") || text.contains("deploy") || text.contains("network") || text.contains("dns") {
        "DevOps、云、网络".to_string()
    } else {
        "通用/未分类".to_string()
    }
}

fn collect_skill_files(root: &Path, results: &mut Vec<LocalSkill>) {
    if results.len() >= 1000 || !root.exists() {
        return;
    }

    let Ok(entries) = fs::read_dir(root) else {
        return;
    };

    for entry in entries.flatten() {
        let path = entry.path();

        if path.is_dir() {
            collect_skill_files(&path, results);
            continue;
        }

        if path.file_name().is_some_and(|name| name == "SKILL.md") {
            if let Some(skill) = parse_skill_file(&path) {
                results.push(skill);
            }
        }
    }
}

#[tauri::command]
fn scan_environment() -> Vec<CommandProbe> {
    vec![
        first_successful_probe("python", "Python", &["python --version", "py -3 --version"]),
        first_successful_probe("node", "Node.js", &["node --version"]),
        first_successful_probe("npm", "npm", &["npm --version"]),
        first_successful_probe("git", "Git", &["git --version"]),
        first_successful_probe("powershell", "PowerShell", &["pwsh --version", "powershell -NoProfile -Command \"$PSVersionTable.PSVersion.ToString()\""]),
        first_successful_probe("webview2", "WebView2", &["reg query HKCU\\Software\\Microsoft\\EdgeUpdate\\Clients", "reg query HKLM\\Software\\Microsoft\\EdgeUpdate\\Clients"]),
        first_successful_probe("codex-cli", "Codex CLI", &["codex --version"]),
        first_successful_probe("claude-cli", "Claude CLI", &["claude --version"]),
        first_successful_probe("github-cli", "GitHub CLI", &["gh --version"]),
        first_successful_probe("winget", "winget", &["winget --version"]),
    ]
}

#[tauri::command]
fn read_known_config_status() -> Vec<ConfigFileStatus> {
    let files = vec![
        ("codex-config", "Codex config.toml", user_path(&[".codex", "config.toml"])),
        ("codex-agents", "Codex AGENTS.md", user_path(&[".codex", "AGENTS.md"])),
        ("claude-settings", "Claude settings.json", user_path(&[".claude", "settings.json"])),
        ("codex-plus-plus", "Codex++ user_scripts.json", app_data_path(&["Codex++", "user_scripts.json"])),
        ("cc-switch-settings", "CC Switch settings.json", user_path(&[".cc-switch", "settings.json"])),
        ("cc-switch-db", "CC Switch database", user_path(&[".cc-switch", "cc-switch.db"])),
    ];

    files
        .into_iter()
        .map(|(id, label, path)| ConfigFileStatus {
            id: id.to_string(),
            label: label.to_string(),
            exists: path.exists(),
            redacted_preview: read_redacted_preview(&path),
            path: path.display().to_string(),
        })
        .collect()
}

#[tauri::command]
fn load_local_skill_catalog() -> Vec<LocalSkill> {
    let roots = vec![
        user_path(&[".codex", "skills"]),
        user_path(&[".agents", "skills"]),
        user_path(&[".codex", "skills", ".system"]),
        user_path(&[".codex", "plugins", "cache"]),
    ];
    let mut skills = Vec::new();

    for root in roots {
        collect_skill_files(&root, &mut skills);
    }

    skills.sort_by(|a, b| a.name.cmp(&b.name).then(a.source_path.cmp(&b.source_path)));
    skills.dedup_by(|a, b| a.name == b.name && a.source_path == b.source_path);
    skills
}

#[tauri::command]
fn build_download_plan(request: DownloadPlanRequest) -> Vec<DownloadPlanItem> {
    request
        .selected_targets
        .iter()
        .map(|target| {
            let source = if request.china_mirror_first {
                "中国大陆镜像源优先"
            } else {
                "官方源优先"
            };

            DownloadPlanItem {
                id: target.clone(),
                label: format!("准备 {target}"),
                source: source.to_string(),
                fallback: "失败后自动切换 GitHub 加速、npm 镜像、官方源和离线缓存。".to_string(),
                target_path: request.offline_cache_path.clone(),
                notes: "此命令只生成计划，不执行下载或安装。".to_string(),
            }
        })
        .collect()
}

#[tauri::command]
fn preview_config_writes(request: ConfigPreviewRequest) -> Vec<ConfigPreviewItem> {
    let mut items = Vec::new();

    if request.initialize_codex {
        items.push(ConfigPreviewItem {
            path: user_path(&[".codex", "config.toml"]).display().to_string(),
            action: "合并 Codex 服务商、默认选项和 Codex++ 兼容配置。".to_string(),
            risk: "中：写入前会备份原文件。".to_string(),
        });
    }

    if request.initialize_claude {
        items.push(ConfigPreviewItem {
            path: user_path(&[".claude", "settings.json"]).display().to_string(),
            action: "写入 Claude 服务商、默认模型和 CC Switch 兼容配置。".to_string(),
            risk: "中：写入前会备份原文件。".to_string(),
        });
    }

    if request.initialize_skills {
        items.push(ConfigPreviewItem {
            path: user_path(&[".codex", "skill-routing.zh-CN.md"]).display().to_string(),
            action: "生成 skill 路由索引，并同步到 Claude 可读目录。".to_string(),
            risk: "低：只新增或覆盖助手生成文件。".to_string(),
        });
    }

    if request.initialize_dialogue {
        items.push(ConfigPreviewItem {
            path: user_path(&[".codex", "AGENTS.md"]).display().to_string(),
            action: "写入底层会话规则，Claude 使用同款规则模板。".to_string(),
            risk: "中：写入前会展示 diff 并备份。".to_string(),
        });
    }

    items
}

#[tauri::command]
fn export_diagnostic_report(request: DiagnosticExportRequest) -> Result<DiagnosticExportResult, String> {
    let diagnostics_dir = local_app_data_path(&["CodexClaudeAssistant", "diagnostics"]);
    fs::create_dir_all(&diagnostics_dir).map_err(|error| error.to_string())?;
    let file_path = diagnostics_dir.join("diagnostic-report.json");
    fs::write(&file_path, redact_secrets(&request.content)).map_err(|error| error.to_string())?;

    Ok(DiagnosticExportResult {
        path: file_path.display().to_string(),
    })
}

#[tauri::command]
fn apply_configuration(request: ApplyConfigurationRequest) -> Result<Vec<WriteResult>, String> {
    let mut results = Vec::new();

    if request.initialize_codex {
        let codex_providers = providers_for_app(&request.providers, "codex");
        let content = provider_json("codex", codex_providers)?;
        results.push(write_with_backup(
            "codex-provider-draft",
            user_path(&[".codex", "codex-claude-assistant.providers.json"]),
            &content,
        )?);
    }

    if request.initialize_claude {
        let claude_providers = providers_for_app(&request.providers, "claude");
        let content = provider_json("claude", claude_providers)?;
        results.push(write_with_backup(
            "claude-provider-draft",
            user_path(&[".claude", "codex-claude-assistant.providers.json"]),
            &content,
        )?);

        results.push(write_with_backup(
            "cc-switch-provider-draft",
            user_path(&[".cc-switch", "codex-claude-assistant.providers.json"]),
            &content,
        )?);
    }

    if request.initialize_skills {
        results.push(write_with_backup(
            "codex-skill-index",
            user_path(&[".codex", "skill-routing.generated.zh-CN.md"]),
            &request.skill_index_markdown,
        )?);

        results.push(write_with_backup(
            "claude-skill-index",
            user_path(&[".claude", "skill-routing.generated.zh-CN.md"]),
            &request.skill_index_markdown,
        )?);
    }

    if request.initialize_dialogue {
        results.push(write_with_backup(
            "codex-dialogue",
            user_path(&[".codex", "AGENTS.generated.md"]),
            &request.dialogue_markdown,
        )?);

        results.push(write_with_backup(
            "claude-dialogue",
            user_path(&[".claude", "CLAUDE.generated.md"]),
            &request.dialogue_markdown,
        )?);
    }

    if results.is_empty() {
        return Err("No configuration sections were selected for writing.".to_string());
    }

    Ok(results)
}

#[tauri::command]
fn run_install_recipe(request: InstallRecipeRequest) -> Result<InstallRecipeResult, String> {
    let command = install_recipe_command(&request.id, request.china_mirror_first)?;
    let (success, exit_code, output) = run_shell_command(&command);

    Ok(InstallRecipeResult {
        id: request.id,
        command,
        success,
        exit_code,
        output,
        message: if success {
            "安装配方执行完成。".to_string()
        } else {
            "安装配方执行失败，请查看输出并尝试切换镜像或手动安装。".to_string()
        },
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            scan_environment,
            read_known_config_status,
            load_local_skill_catalog,
            build_download_plan,
            preview_config_writes,
            export_diagnostic_report,
            apply_configuration,
            run_install_recipe
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
