# health-data-app
A Health Tracking app (currently Fitbit data stored to DynamoDB)

## Current State
- OAuth connection to Fitbit.com (note: using OAuth 2.0 Application Type = 'personal', because only a personal App has access to intraday data)
- First Activity (HeartRate) get functionality
- Added simple chart.js visualization for activity data

## Next Steps:
- ~~~ Re-configure OAuth profile information for better visibility for POC Web app ~~~<br>
<== due to data visibility, may not be able to use "client" OAuth App Type
- Take returned (and visualized) data and upload to DynamoDB
- much more later
