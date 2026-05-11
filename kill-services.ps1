$ports = @(8081, 8082, 8083, 8084, 8085, 8086, 10010, 9100)
foreach ($p in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "Killed PID $($conn.OwningProcess) on port $p"
    } else {
        Write-Host "Port $p is free"
    }
}
