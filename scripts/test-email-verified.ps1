# Test script to verify email_verified column and test end-to-end flow
param(
    [string]$ServiceKey = (Get-Content .env | Where-Object { $_ -match 'SUPABASE_SERVICE_ROLE_KEY=' } | ForEach-Object { $_.Split('=')[1] }),
    [string]$Email = 'akinrodoluseun12@gmail.com',
    [string]$UserId = '16b01d8d-b636-493e-9652-1b22869817d7'
)

$rest = 'https://evcqpapvcvmljgqiuzsq.supabase.co/rest/v1'
$fnBase = 'https://evcqpapvcvmljgqiuzsq.functions.supabase.co'
$hdrs_svc = @{ 
    'apikey' = $ServiceKey
    'Authorization' = "Bearer $ServiceKey"
    'Accept' = 'application/json'
}
$latestCode = $null

Write-Host "=== 1. Reset email_verified to false ===" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod -Uri "$rest/profiles?id=eq.$UserId" -Headers $hdrs_svc -Method Patch -Body '{"email_verified": false}' -ContentType 'application/json' -ErrorAction Stop
    Write-Host "✓ Reset complete" -ForegroundColor Green
}
catch {
    Write-Host "✗ Reset failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== 2. Query recent email_verifications ===" -ForegroundColor Cyan
try {
    $query = 'select=id,code,expires_at,used_at,created_at&user_id=eq.' + $UserId + '&order=created_at.desc&limit=3'
    $uri = "$rest/email_verifications?$query"
    $r = Invoke-RestMethod -Uri $uri -Headers $hdrs_svc -Method Get -ErrorAction Stop
    Write-Host "✓ Found tokens:" -ForegroundColor Green
    $r | ForEach-Object { Write-Host "  ID: $($_.id), Code: $($_.code)" }
    if ($r.Count -gt 0) {
        $latestCode = $r[0].code
        Write-Host "Using code: $latestCode" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "✗ Query failed: $($_.Exception.Message)" -ForegroundColor Red
}

if ($latestCode) {
    Write-Host "`n=== 3. Call verify-email-code function ===" -ForegroundColor Cyan
    try {
        $body = @{ code = $latestCode; email = $Email } | ConvertTo-Json
        $r = Invoke-RestMethod -Uri "$fnBase/verify-email-code" -Headers @{ 'Content-Type' = 'application/json' } -Method Post -Body $body -ErrorAction Stop
        Write-Host "✓ Verify SUCCESS:" -ForegroundColor Green
        Write-Host ($r | ConvertTo-Json -Depth 3)
    }
    catch {
        Write-Host "✗ Verify failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = [System.IO.StreamReader]::new($stream)
            $errBody = $reader.ReadToEnd()
            Write-Host "Response: $errBody" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n=== 4. Check final profile state ===" -ForegroundColor Cyan
try {
    $query = 'id=eq.' + $UserId + '&select=id,email,email_verified'
    $uri = "$rest/profiles?$query"
    $r = Invoke-RestMethod -Uri $uri -Headers $hdrs_svc -Method Get -ErrorAction Stop
    Write-Host "✓ Final state:" -ForegroundColor Green
    Write-Host ($r | ConvertTo-Json -Depth 3)
}
catch {
    Write-Host "✗ GET failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nDone" -ForegroundColor Cyan
