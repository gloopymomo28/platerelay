@echo off
echo Starting PlateRelay Backend...
cd api
python -m uvicorn index:app --reload --env-file ../.env
