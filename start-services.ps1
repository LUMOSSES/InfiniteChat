$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
$baseDir = "D:\Desktop\InfiniteChat"
$agentDir = "D:\Desktop\InfinteChat-Agent"
$tmpDir = $env:TEMP

$jars = [ordered]@{
    "AuthenticationService"        = "$baseDir\AuthenticationService\target\AuthenticationService-0.0.1-SNAPSHOT.jar";
    "GateWay"                      = "$baseDir\GateWay\target\GateWay-0.0.1-SNAPSHOT.jar";
    "RealTimeCommunicationService" = "$baseDir\RealTimeCommunicationService\target\RealTimeCommunicationService-0.0.1-SNAPSHOT.jar";
    "ContanctService"              = "$baseDir\ContanctService\target\ContanctService-0.0.1-SNAPSHOT.jar";
    "MessageingService"            = "$baseDir\MessageingService\target\MessageingService-0.0.1-SNAPSHOT.jar";
    "OfflineDataStoreService"      = "$baseDir\OfflineDataStoreService\target\OfflineDataStoreService-0.0.1-SNAPSHOT.jar";
    "MomentService"                = "$baseDir\MomentService\target\MomentService-0.0.1-SNAPSHOT.jar";
    "InfiniteChat-Agent"           = "$agentDir\target\InfinteChat-Agent-0.0.1-SNAPSHOT.jar"
}

foreach ($svc in $jars.Keys) {
    $jar = $jars[$svc]
    $log = "$tmpDir\infinitechat-$svc.log"
    $errLog = "$tmpDir\infinitechat-$svc-err.log"
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
    $log = "$tmpDir\infinitechat-$svc.log"
    if (Test-Path $log) {
        $started = Select-String -Path $log -Pattern "Started.*Application" -SimpleMatch -Quiet
        $agentOk = Select-String -Path $log -Pattern "register finished" -SimpleMatch -Quiet
        Write-Host "$svc : Started=$started, Nacos=$agentOk"
    } else {
        Write-Host "$svc : no log yet"
    }
}
