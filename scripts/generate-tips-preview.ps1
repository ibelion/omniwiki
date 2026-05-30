param([string[]]$Champions = @('volibear','illaoi','blitzcrank','caitlyn','udyr'))

$ollamaUrl = "http://localhost:11434/api/generate"

foreach ($champ in $Champions) {
    $dataFile = "$PSScriptRoot\tips-gen-$champ.json"
    if (-not (Test-Path $dataFile)) {
        Write-Warning "No data file for $champ, skipping"
        continue
    }

    $champData = Get-Content $dataFile -Raw

    $prompt = @"
You are writing gameplay tips for a League of Legends wiki. Given a champion's ability data, write exactly 3 "Playing as" tips and 3 "Playing against" tips.

Hard rules:
- Only reference mechanics explicitly stated in the ability descriptions. Do not invent mechanics, numbers, or interactions not listed.
- For each ability, identify WHO benefits and WHO is harmed before writing anything about it. Never flip this.
- Be specific to this champion. Tips like "use your abilities in the right order" or "coordinate with your team" are banned.
- Each tip is 1-2 sentences maximum. Direct and concrete.
- If an ability description is too vague to write a confident tip about, skip it and use a different ability instead.
- Do not mention specific damage numbers unless they appear in the data.
- Output ONLY valid JSON in this exact shape with no other text:
{
  "allytips": ["tip1", "tip2", "tip3"],
  "enemytips": ["tip1", "tip2", "tip3"]
}

Champion data:
$champData
"@

    $body = @{
        model  = "qwen2.5-coder:14b"
        prompt = $prompt
        stream = $false
        options = @{ temperature = 0.2; num_predict = 512 }
    } | ConvertTo-Json -Depth 5

    Write-Host "`n=== $($champ.ToUpper()) ===" -ForegroundColor Cyan

    try {
        $resp = Invoke-RestMethod -Uri $ollamaUrl -Method Post -Body $body -ContentType "application/json" -TimeoutSec 60
        $raw = $resp.response.Trim()

        if ($raw -match '```json\s*([\s\S]+?)\s*```') { $raw = $matches[1] }
        elseif ($raw -match '```\s*([\s\S]+?)\s*```') { $raw = $matches[1] }

        $tips = $raw | ConvertFrom-Json
        Write-Host "Playing as:" -ForegroundColor Green
        $tips.allytips | ForEach-Object { Write-Host "  - $_" }
        Write-Host "Playing against:" -ForegroundColor Red
        $tips.enemytips | ForEach-Object { Write-Host "  - $_" }

        $raw | Out-File "$PSScriptRoot\tips-output-$champ.json" -Encoding utf8
    } catch {
        Write-Warning "Failed for $champ`: $_"
    }
}
