$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
$baseDir = "D:\Desktop\InfiniteChat"
$agentDir = "D:\Desktop\IM-Agent"
$tmpDir = $env:TEMP

$jars = [ordered]@{
    "AuthService"       = "$baseDir\AuthenticationService\target\AuthService-0.0.1-SNAPSHOT.jar";
    "Gateway"           = "$baseDir\GateWay\target\Gateway-0.0.1-SNAPSHOT.jar";
    "RealTimeService"   = "$baseDir\RealTimeCommunicationService\target\RealTimeService-0.0.1-SNAPSHOT.jar";
    "ContactService"    = "$baseDir\ContanctService\target\ContactService-0.0.1-SNAPSHOT.jar";
    "MessagingService"  = "$baseDir\MessageingService\target\MessagingService-0.0.1-SNAPSHOT.jar";
    "OfflineService"    = "$baseDir\OfflineDataStoreService\target\OfflineService-0.0.1-SNAPSHOT.jar";
    "MomentService"     = "$baseDir\MomentService\target\MomentService-0.0.1-SNAPSHOT.jar";
    "IMHub-Agent"       = "$agentDir\target\IMHub-Agent-0.0.1-SNAPSHOT.jar"
}

foreach ($svc in $jars.Keys) {
    $jar = $jars[$svc]
    $log = "$tmpDir\imhub-$svc.log"
    $errLog = "$tmpDir\imhub-$svc-err.log"
    $proc = Start-Process java `
        -ArgumentList "-jar", "`"$jar`"" `
        -PassThru `
        -NoNewWindow `
        -RedirectStandardOutput $log `
        -RedirectStandardError $errLog
    Write-Host "Started $svc  (PID=$($proc.Id))"
    Start-Sleep -Seconds 2
}

Write-Host "`nAll $($jars.Count) services launched. Waiting for startup..."
Start-Sleep -Seconds 18

Write-Host "`n=== Service Status ==="
foreach ($svc in $jars.Keys) {
    $log = "$tmpDir\imhub-$svc.log"
    if (Test-Path $log) {
        $started = Select-String -Path $log -Pattern "Started.*Application" -SimpleMatch -Quiet
        $agentOk = Select-String -Path $log -Pattern "register finished" -SimpleMatch -Quiet
        Write-Host "$svc : Started=$started, Nacos=$agentOk"
    } else {
        Write-Host "$svc : no log yet"
    }
}
