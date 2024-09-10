# init.ps1
$cliPath = (Join-Path -Path $PSScriptRoot -ChildPath 'cli')
if (-not ($env:Path -split ';' | ForEach-Object { $_.Trim() } | Where-Object { $_ -eq $cliPath })) {
    $env:Path = "$env:Path;$cliPath"
    Write-Host "The $cliPath path has been added to the PATH for this session."
} else {
    Write-Host "The $cliPath path is already in the PATH."
}

Write-Host "You can now use the 'cn' command in this session."
