# CoreID to GidiPIN Rebranding Script
Write-Host "Starting CoreID -> GidiPIN rebranding..." -ForegroundColor Green

$files = @(
    "src\components\VerificationBanner.tsx",
    "src\components\TermsOfService.tsx",
    "src\components\SolutionsPage.tsx",
    "src\components\SimpleRegistration.tsx",
    "src\components\Router.tsx",
    "src\components\PublicProfile.tsx",
    "src\components\ProfileBadge.tsx",
    "src\components\PrivacyPolicy.tsx",
    "src\components\ProfessionalDashboard.tsx",
    "src\components\PremiumIdentityCard.tsx",
    "src\components\PINIdentityCard.tsx",
    "src\components\OurStoryPage.tsx",
    "src\components\onboarding\WelcomeModal.tsx",
    "src\components\Logo.tsx",
    "src\components\IdentityCard.tsx",
    "src\components\HowItWorksPage.tsx",
    "src\components\GDPRCompliance.tsx",
    "src\components\CookiesPolicy.tsx",
    "src\components\dashboard\PINGenerationCard.tsx",
    "src\features\auth\AuthContainer.tsx",
    "public\manifest.json"
)

$count = 0
foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        $newContent = $content -replace 'CoreID', 'GidiPIN'
        
        if ($content -ne $newContent) {
            Set-Content $fullPath $newContent -NoNewline
            $count++
            Write-Host "Updated: $file" -ForegroundColor Cyan
        }
    } else {
        Write-Host "Not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "Completed! Updated $count files." -ForegroundColor Green
