param(
    [Parameter(Position = 0)]
    [string]$Service = "all",

    [switch]$Follow,
    [switch]$Error
)

$tmpDir = $env:TEMP
$services = @("AuthenticationService", "GateWay", "MessageingService", "RealTimeCommunicationService", "ContanctService", "OfflineDataStoreService", "MomentService")

function Show-Log {
    param($svc, $tail)
    $suffix = if ($Error) { "-err.log" } else { ".log" }
    $log = "$tmpDir\infinitechat-$svc$suffix"
    if (Test-Path $log) {
        Write-Host "`n=== $svc ($suffix) ===" -ForegroundColor Green
        if ($Follow) {
            Get-Content $log -Wait -Tail 50
        } else {
            Get-Content $log -Tail $tail
        }
    } else {
        Write-Host "`n=== $svc : no log file ===" -ForegroundColor Yellow
    }
}

$tail = if ($Follow) { 10 } else { 50 }

if ($Service -eq "all") {
    foreach ($s in $services) {
        Show-Log $s $tail
    }
} else {
    Show-Log $Service $tail
}
