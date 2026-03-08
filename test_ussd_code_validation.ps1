# Test USSD Code Validation

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "USSD Code Validation Tests" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Invalid code should be rejected
Write-Host "[TEST 1] Invalid USSD Code: *999#" -ForegroundColor Yellow
$body1 = ConvertTo-Json -InputObject @{
    sessionId = "test-invalid-1"
    phoneNumber = "254712345678"
    text = ""
    serviceCode = "*999#"
}
$response1 = Invoke-WebRequest -Uri 'http://localhost:5000/api/ussd' -Method POST -Body $body1 -ContentType 'application/json'
$result1 = $response1.Content
Write-Host "Response: $result1" -ForegroundColor Green
if ($result1 -match "Invalid USSD code") {
    Write-Host "✅ PASSED: Invalid code rejected`n" -ForegroundColor Green
} else {
    Write-Host "❌ FAILED: Invalid code was not rejected`n" -ForegroundColor Red
}

# Test 2: Valid code *123# should be accepted
Write-Host "[TEST 2] Valid USSD Code: *123#" -ForegroundColor Yellow
$body2 = ConvertTo-Json -InputObject @{
    sessionId = "test-valid-1"
    phoneNumber = "254712345678"
    text = ""
    serviceCode = "*123#"
}
$response2 = Invoke-WebRequest -Uri 'http://localhost:5000/api/ussd' -Method POST -Body $body2 -ContentType 'application/json'
$result2 = $response2.Content
Write-Host "Response: $result2" -ForegroundColor Green
if ($result2 -match "Choose language|language" -or $result2 -match "CON") {
    Write-Host "✅ PASSED: Valid code accepted`n" -ForegroundColor Green
} else {
    Write-Host "❌ FAILED: Valid code not accepted`n" -ForegroundColor Red
}

# Test 3: Shorthand code 123 should be accepted
Write-Host "[TEST 3] Valid USSD Code: 123 (shorthand)" -ForegroundColor Yellow
$body3 = ConvertTo-Json -InputObject @{
    sessionId = "test-valid-2"
    phoneNumber = "254712345678"
    text = ""
    serviceCode = "123"
}
$response3 = Invoke-WebRequest -Uri 'http://localhost:5000/api/ussd' -Method POST -Body $body3 -ContentType 'application/json'
$result3 = $response3.Content
Write-Host "Response: $result3" -ForegroundColor Green
if ($result3 -match "Choose language|language" -or $result3 -match "CON") {
    Write-Host "✅ PASSED: Shorthand code accepted`n" -ForegroundColor Green
} else {
    Write-Host "❌ FAILED: Shorthand code not accepted`n" -ForegroundColor Red
}

# Test 4: Empty serviceCode should be accepted (backward compatibility)
Write-Host "[TEST 4] Empty Service Code (backward compatibility)" -ForegroundColor Yellow
$body4 = ConvertTo-Json -InputObject @{
    sessionId = "test-empty-1"
    phoneNumber = "254712345678"
    text = ""
    serviceCode = ""
}
$response4 = Invoke-WebRequest -Uri 'http://localhost:5000/api/ussd' -Method POST -Body $body4 -ContentType 'application/json'
$result4 = $response4.Content
Write-Host "Response: $result4" -ForegroundColor Green
if ($result4 -match "Choose language|language" -or $result4 -match "CON") {
    Write-Host "✅ PASSED: Empty code accepted (backward compatible)`n" -ForegroundColor Green
} else {
    Write-Host "❌ FAILED: Empty code not accepted`n" -ForegroundColor Red
}

# Test 5: Another invalid code
Write-Host "[TEST 5] Invalid USSD Code: *456#" -ForegroundColor Yellow
$body5 = ConvertTo-Json -InputObject @{
    sessionId = "test-invalid-2"
    phoneNumber = "254712345678"
    text = ""
    serviceCode = "*456#"
}
$response5 = Invoke-WebRequest -Uri 'http://localhost:5000/api/ussd' -Method POST -Body $body5 -ContentType 'application/json'
$result5 = $response5.Content
Write-Host "Response: $result5" -ForegroundColor Green
if ($result5 -match "Invalid USSD code") {
    Write-Host "✅ PASSED: Invalid code rejected`n" -ForegroundColor Green
} else {
    Write-Host "❌ FAILED: Invalid code was not rejected`n" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary:" -ForegroundColor Cyan
Write-Host "Only *123#, 123, and empty codes are accepted" -ForegroundColor Green
Write-Host "All other codes are rejected" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
