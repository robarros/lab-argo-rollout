# Guia Rápido de Deploy

## Deploy Inicial

```bash
# 1. Aplicar configurações do ArgoCD
kubectl apply -f argocd/project.yaml
kubectl apply -f argocd/istio-application.yaml
kubectl apply -f argocd/application.yaml

# 2. Verificar aplicações criadas
kubectl get applications -n argocd

# 3. Sincronizar aplicações (se não estiver automated)
kubectl patch application meu-app -n argocd -p '{"operation":{"initiatedBy":{"username":"admin"},"sync":{}}}' --type merge
```

## Fazer um Novo Deploy

```bash
# 1. Atualizar a imagem no Git
# Edite base/rollout.yaml e altere a imagem

# 2. Commit e push
git add base/rollout.yaml
git commit -m "Update image to v2.0.0"
git push

# 3. ArgoCD detecta automaticamente (ou force sync)
kubectl patch app meu-app -n argocd -p '{"metadata": {"annotations":{"argocd.argoproj.io/refresh":"normal"}}}' --type merge

# 4. Acompanhar o rollout
kubectl argo rollouts get rollout meu-app-rollout -n app --watch

# 5. Promover manualmente em cada etapa
kubectl argo rollouts promote meu-app-rollout -n app
```

## Comandos Úteis

```bash
# Ver status do rollout
kubectl argo rollouts status meu-app-rollout -n app

# Dashboard do Argo Rollouts
kubectl argo rollouts dashboard

# Abortar rollout
kubectl argo rollouts abort meu-app-rollout -n app

# Ver histórico
kubectl argo rollouts history meu-app-rollout -n app

# Rollback para revisão anterior
kubectl argo rollouts undo meu-app-rollout -n app
```
