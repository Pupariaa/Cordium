# init.ps1
[System.Environment]::SetEnvironmentVariable('Path', "$env:Path;$PSScriptRoot", 'User')
Write-Host "You can now use the 'cn' command in this session."
