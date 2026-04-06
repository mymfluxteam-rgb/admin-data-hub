export const SDK_LANGUAGES = [
    { id: "csharp",     label: "C#",         highlight: "csharp" },
    { id: "wpf",        label: "WPF / XAML",  highlight: "csharp" },
    { id: "unity",      label: "Unity (C#)",  highlight: "csharp" },
    { id: "python",     label: "Python",      highlight: "python" },
    { id: "cpp",        label: "C++",         highlight: "cpp" },
    { id: "java",       label: "Java",        highlight: "java" },
    { id: "typescript", label: "TypeScript",  highlight: "typescript" },
    { id: "rust",       label: "Rust",        highlight: "rust" },
    { id: "go",         label: "Go",          highlight: "go" },
    { id: "php",        label: "PHP",         highlight: "php" },
];

export const SDK_EXAMPLES = {
    csharp: `using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

class LicenseClient
{
    private static readonly HttpClient http = new();
    private const string ApiUrl = "https://your-domain.com/api/v1/verify";

    public record VerifyRequest(string app_id, string app_secret, string license_key);
    public record LicenseInfo(string id, string license_key, string status, string user_label, DateTime? expires_at);
    public record AppInfo(string id, string app_name);
    public record VerifyResponse(bool valid, string message, LicenseInfo license, AppInfo app);

    public static async Task<VerifyResponse?> VerifyLicenseAsync(
        string appId, string appSecret, string licenseKey)
    {
        var payload = new VerifyRequest(appId, appSecret, licenseKey);
        var response = await http.PostAsJsonAsync(ApiUrl, payload);
        return await response.Content.ReadFromJsonAsync<VerifyResponse>();
    }

    static async Task Main(string[] args)
    {
        const string APP_ID     = "your-app-id";
        const string APP_SECRET = "your-app-secret";
        const string LICENSE_KEY = Console.ReadLine() ?? "";

        var result = await VerifyLicenseAsync(APP_ID, APP_SECRET, LICENSE_KEY);

        if (result?.valid == true)
        {
            Console.WriteLine($"✓ License valid — welcome, {result.license.user_label}!");
            // Proceed with app startup
        }
        else
        {
            Console.WriteLine($"✗ License invalid: {result?.message}");
            Environment.Exit(1);
        }
    }
}`,

    wpf: `// App.xaml.cs — WPF startup license gate
using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Windows;

namespace MyApp
{
    public partial class App : Application
    {
        private const string API_URL    = "https://your-domain.com/api/v1/verify";
        private const string APP_ID     = "your-app-id";
        private const string APP_SECRET = "your-app-secret";

        protected override async void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);

            // Show license input dialog before main window
            var loginWindow = new LicenseWindow();
            if (loginWindow.ShowDialog() != true)
            {
                Shutdown();
                return;
            }

            bool valid = await VerifyAsync(loginWindow.LicenseKey);
            if (!valid)
            {
                MessageBox.Show("Invalid or expired license key.", "Access Denied",
                    MessageBoxButton.OK, MessageBoxImage.Error);
                Shutdown();
                return;
            }

            new MainWindow().Show();
        }

        private static async Task<bool> VerifyAsync(string key)
        {
            using var http = new HttpClient();
            var payload = new { app_id = APP_ID, app_secret = APP_SECRET, license_key = key };
            var res = await http.PostAsJsonAsync(API_URL, payload);
            if (!res.IsSuccessStatusCode) return false;
            var body = await res.Content.ReadFromJsonAsync<VerifyResponse>();
            return body?.valid == true;
        }

        private record VerifyResponse(bool valid, string message);
    }
}`,

    unity: `// LicenseManager.cs — attach to a Manager GameObject
using System;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using Newtonsoft.Json;

public class LicenseManager : MonoBehaviour
{
    [Header("License Settings")]
    public string apiUrl     = "https://your-domain.com/api/v1/verify";
    public string appId      = "your-app-id";
    public string appSecret  = "your-app-secret";

    public static bool IsLicensed { get; private set; }

    void Start()
    {
        string savedKey = PlayerPrefs.GetString("license_key", "");
        if (!string.IsNullOrEmpty(savedKey))
            StartCoroutine(VerifyLicense(savedKey));
    }

    public IEnumerator VerifyLicense(string licenseKey)
    {
        var payload = JsonConvert.SerializeObject(new {
            app_id     = appId,
            app_secret = appSecret,
            license_key = licenseKey
        });

        using var req = new UnityWebRequest(apiUrl, "POST");
        req.uploadHandler   = new UploadHandlerRaw(Encoding.UTF8.GetBytes(payload));
        req.downloadHandler = new DownloadHandlerBuffer();
        req.SetRequestHeader("Content-Type", "application/json");

        yield return req.SendWebRequest();

        if (req.result == UnityWebRequest.Result.Success)
        {
            var resp = JsonConvert.DeserializeObject<VerifyResponse>(req.downloadHandler.text);
            IsLicensed = resp?.valid == true;

            if (IsLicensed)
            {
                PlayerPrefs.SetString("license_key", licenseKey);
                Debug.Log($"License OK — {resp.message}");
            }
            else
            {
                Debug.LogWarning($"License rejected: {resp?.message}");
            }
        }
        else
        {
            Debug.LogError("Network error during license check: " + req.error);
        }
    }

    [Serializable]
    class VerifyResponse { public bool valid; public string message; }
}`,

    python: `import requests
import sys

API_URL    = "https://your-domain.com/api/v1/verify"
APP_ID     = "your-app-id"
APP_SECRET = "your-app-secret"


def verify_license(license_key: str) -> dict | None:
    """Verify a license key against the licensing API."""
    try:
        response = requests.post(
            API_URL,
            json={
                "app_id":      APP_ID,
                "app_secret":  APP_SECRET,
                "license_key": license_key,
            },
            timeout=10,
        )
        return response.json()
    except requests.RequestException as exc:
        print(f"Network error: {exc}", file=sys.stderr)
        return None


def main() -> None:
    license_key = input("Enter your license key: ").strip()

    result = verify_license(license_key)

    if result and result.get("valid"):
        user_label = result["license"].get("user_label") or "user"
        print(f"✓ License valid — welcome, {user_label}!")
    else:
        message = result.get("message", "Unknown error") if result else "No response"
        print(f"✗ License invalid: {message}")
        sys.exit(1)


if __name__ == "__main__":
    main()`,

    cpp: `#include <iostream>
#include <string>
#include <stdexcept>
// Requires libcurl: sudo apt install libcurl4-openssl-dev
// Link with: -lcurl
#include <curl/curl.h>
// Requires nlohmann/json: https://github.com/nlohmann/json
#include <nlohmann/json.hpp>

using json = nlohmann::json;

const std::string API_URL    = "https://your-domain.com/api/v1/verify";
const std::string APP_ID     = "your-app-id";
const std::string APP_SECRET = "your-app-secret";

static size_t WriteCallback(void* contents, size_t size, size_t nmemb, std::string* out) {
    out->append(static_cast<char*>(contents), size * nmemb);
    return size * nmemb;
}

bool verifyLicense(const std::string& licenseKey) {
    CURL* curl = curl_easy_init();
    if (!curl) throw std::runtime_error("Failed to init curl");

    json payload = {
        {"app_id",      APP_ID},
        {"app_secret",  APP_SECRET},
        {"license_key", licenseKey}
    };
    std::string body = payload.dump();
    std::string response;

    curl_slist* headers = nullptr;
    headers = curl_slist_append(headers, "Content-Type: application/json");

    curl_easy_setopt(curl, CURLOPT_URL,            API_URL.c_str());
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS,     body.c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER,     headers);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION,  WriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA,      &response);

    CURLcode res = curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    curl_slist_free_all(headers);

    if (res != CURLE_OK) throw std::runtime_error(curl_easy_strerror(res));

    auto result = json::parse(response);
    return result.value("valid", false);
}

int main() {
    std::string key;
    std::cout << "Enter license key: ";
    std::cin >> key;

    try {
        if (verifyLicense(key)) {
            std::cout << "✓ License valid. Starting application...\\n";
        } else {
            std::cerr << "✗ Invalid license key.\\n";
            return 1;
        }
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << "\\n";
        return 1;
    }
}`,

    java: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class LicenseVerifier {

    private static final String API_URL    = "https://your-domain.com/api/v1/verify";
    private static final String APP_ID     = "your-app-id";
    private static final String APP_SECRET = "your-app-secret";

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public boolean verify(String licenseKey) throws Exception {
        String json = String.format(
            "{\\"app_id\\":\\"%s\\",\\"app_secret\\":\\"%s\\",\\"license_key\\":\\"%s\\"}",
            APP_ID, APP_SECRET, licenseKey
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .timeout(Duration.ofSeconds(10))
                .build();

        HttpResponse<String> response =
                client.send(request, HttpResponse.BodyHandlers.ofString());

        // Simple JSON parsing — use Gson/Jackson for production
        return response.statusCode() == 200
                && response.body().contains("\\"valid\\":true");
    }

    public static void main(String[] args) throws Exception {
        System.out.print("Enter your license key: ");
        String key = new java.util.Scanner(System.in).nextLine().trim();

        LicenseVerifier verifier = new LicenseVerifier();
        if (verifier.verify(key)) {
            System.out.println("✓ License valid — application starting.");
        } else {
            System.err.println("✗ Invalid or expired license key.");
            System.exit(1);
        }
    }
}`,

    typescript: `// licenseClient.ts
const API_URL    = "https://your-domain.com/api/v1/verify";
const APP_ID     = "your-app-id";
const APP_SECRET = "your-app-secret";

interface LicenseInfo {
  id: string;
  license_key: string;
  status: "active" | "inactive" | "banned";
  user_label: string | null;
  expires_at: string | null;
  created_at: string;
}

interface VerifyResponse {
  valid: boolean;
  message: string;
  license?: LicenseInfo;
  app?: { id: string; app_name: string };
}

export async function verifyLicense(licenseKey: string): Promise<VerifyResponse> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id:      APP_ID,
      app_secret:  APP_SECRET,
      license_key: licenseKey,
    }),
  });
  return res.json() as Promise<VerifyResponse>;
}

// Usage example
(async () => {
  const key = process.argv[2] ?? "";
  const result = await verifyLicense(key);

  if (result.valid) {
    console.log(\`✓ Valid — \${result.license?.user_label ?? "user"}\`);
  } else {
    console.error(\`✗ \${result.message}\`);
    process.exit(1);
  }
})();`,

    rust: `// Cargo.toml dependencies:
// reqwest = { version = "0.12", features = ["json", "blocking"] }
// serde = { version = "1", features = ["derive"] }
// tokio = { version = "1", features = ["full"] }

use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::io::{self, Write};

const API_URL: &str    = "https://your-domain.com/api/v1/verify";
const APP_ID: &str     = "your-app-id";
const APP_SECRET: &str = "your-app-secret";

#[derive(Serialize)]
struct VerifyRequest<'a> {
    app_id:      &'a str,
    app_secret:  &'a str,
    license_key: &'a str,
}

#[derive(Deserialize)]
struct LicenseInfo {
    user_label: Option<String>,
}

#[derive(Deserialize)]
struct VerifyResponse {
    valid:   bool,
    message: String,
    license: Option<LicenseInfo>,
}

async fn verify_license(key: &str) -> Result<VerifyResponse, reqwest::Error> {
    Client::new()
        .post(API_URL)
        .json(&VerifyRequest {
            app_id:      APP_ID,
            app_secret:  APP_SECRET,
            license_key: key,
        })
        .send()
        .await?
        .json::<VerifyResponse>()
        .await
}

#[tokio::main]
async fn main() {
    print!("Enter license key: ");
    io::stdout().flush().unwrap();

    let mut key = String::new();
    io::stdin().read_line(&mut key).unwrap();
    let key = key.trim();

    match verify_license(key).await {
        Ok(res) if res.valid => {
            let label = res.license
                .and_then(|l| l.user_label)
                .unwrap_or_else(|| "user".into());
            println!("✓ License valid — welcome, {}!", label);
        }
        Ok(res) => {
            eprintln!("✗ {}", res.message);
            std::process::exit(1);
        }
        Err(e) => {
            eprintln!("Network error: {}", e);
            std::process::exit(1);
        }
    }
}`,

    go: `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

const (
	apiURL    = "https://your-domain.com/api/v1/verify"
	appID     = "your-app-id"
	appSecret = "your-app-secret"
)

type verifyRequest struct {
	AppID      string \`json:"app_id"\`
	AppSecret  string \`json:"app_secret"\`
	LicenseKey string \`json:"license_key"\`
}

type licenseInfo struct {
	UserLabel *string \`json:"user_label"\`
}

type verifyResponse struct {
	Valid   bool         \`json:"valid"\`
	Message string       \`json:"message"\`
	License *licenseInfo \`json:"license"\`
}

func verifyLicense(key string) (*verifyResponse, error) {
	body, _ := json.Marshal(verifyRequest{
		AppID: appID, AppSecret: appSecret, LicenseKey: key,
	})

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post(apiURL, "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)
	var result verifyResponse
	return &result, json.Unmarshal(raw, &result)
}

func main() {
	fmt.Print("Enter license key: ")
	var key string
	fmt.Scan(&key)
	key = strings.TrimSpace(key)

	result, err := verifyLicense(key)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Network error: %v\\n", err)
		os.Exit(1)
	}

	if result.Valid {
		label := "user"
		if result.License != nil && result.License.UserLabel != nil {
			label = *result.License.UserLabel
		}
		fmt.Printf("✓ License valid — welcome, %s!\\n", label)
	} else {
		fmt.Fprintf(os.Stderr, "✗ %s\\n", result.Message)
		os.Exit(1)
	}
}`,

    php: `<?php
// license.php — require at the top of your app bootstrap

define('API_URL',    'https://your-domain.com/api/v1/verify');
define('APP_ID',     'your-app-id');
define('APP_SECRET', 'your-app-secret');

/**
 * Verify a license key via the licensing API.
 * Returns the parsed response array, or null on network error.
 */
function verifyLicense(string $licenseKey): ?array {
    $payload = json_encode([
        'app_id'      => APP_ID,
        'app_secret'  => APP_SECRET,
        'license_key' => $licenseKey,
    ]);

    $ch = curl_init(API_URL);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT        => 10,
    ]);

    $response = curl_exec($ch);
    $error    = curl_error($ch);
    curl_close($ch);

    if ($error) {
        error_log("License check network error: $error");
        return null;
    }

    return json_decode($response, true);
}

// ── Usage ─────────────────────────────────────────────────────────────────────
$key    = $_POST['license_key'] ?? '';
$result = verifyLicense($key);

if ($result && $result['valid'] === true) {
    $label = $result['license']['user_label'] ?? 'user';
    echo "✓ License valid — welcome, $label!";
    // Proceed with app logic...
} else {
    $msg = $result['message'] ?? 'License check failed';
    http_response_code(403);
    exit("✗ $msg");
}`,
};
