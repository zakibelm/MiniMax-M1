#!/bin/bash
# scripts/deploy-progressive.sh

echo "Déploiement progressif du Media Agent..."

# Phase 1: Infrastructure
echo "Phase 1: Infrastructure de base"
docker-compose up -d redis postgres
sleep 10

# Phase 2: Agents core
echo "Phase 2: Agents essentiels"
docker-compose up -d orchestrator drive-agent
sleep 15

# Phase 3: Interface utilisateur
echo "Phase 3: Interface Telegram"
docker-compose up -d telegram-bot

# Phase 4: Agents avancés (optionnel)
if [ "$1" = "full" ]; then
  echo "Phase 4: Agents avancés"
  docker-compose up -d email-agent calendar-agent creative-agent
fi

echo "Déploiement terminé !"
