# ArgoCD + Argo Rollouts - Estrutura Integrada

Esta estrutura organiza seus manifestos Kubernetes para usar **ArgoCD** para GitOps e **Argo Rollouts** para deployments progressivos com canary releases.

## 📁 Estrutura do Projeto

```
argocd-rollout-app/
├── argocd/                      # Manifestos do ArgoCD
│   ├── project.yaml             # AppProject para organizar aplicações
│   ├── application.yaml         # Application para a app principal
│   └── istio-application.yaml   # Application para config do Istio
├── base/                        # Manifestos base da aplicação
│   ├── namespace.yaml           # Namespace com istio-injection enabled
│   ├── rollout.yaml             # Rollout com estratégia canary
│   ├── services.yaml            # Services stable e canary
│   └── kustomization.yaml       # Kustomize para base
└── istio/                       # Configurações do Istio
    ├── gateway.yaml             # Gateway do Istio
    ├── virtualservice.yaml      # VirtualService para roteamento
    ├── destinationrule.yaml     # DestinationRule (opcional)
    └── kustomization.yaml       # Kustomize para Istio
```

## 🚀 Como Usar

### 1. Pré-requisitos

Certifique-se de ter instalado no seu cluster:

- **ArgoCD**: Para GitOps
- **Argo Rollouts**: Para deployments progressivos
- **Istio**: Para service mesh e traffic management

```bash
# Instalar ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Instalar Argo Rollouts
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# Instalar kubectl plugin do Argo Rollouts
curl -LO https://github.com/argoproj/argo-rollouts/releases/latest/download/kubectl-argo-rollouts-linux-amd64
chmod +x kubectl-argo-rollouts-linux-amd64
sudo mv kubectl-argo-rollouts-linux-amd64 /usr/local/bin/kubectl-argo-rollouts
```

### 2. Configurar o Repositório Git

1. Faça push desta estrutura para seu repositório Git
2. Edite os arquivos em `argocd/`:
   - `application.yaml`: Altere `repoURL` para seu repositório
   - `istio-application.yaml`: Altere `repoURL` para seu repositório

### 3. Aplicar os Manifestos do ArgoCD

```bash
# Criar o projeto
kubectl apply -f argocd-rollout-app/argocd/project.yaml

# Criar as aplicações
kubectl apply -f argocd-rollout-app/argocd/istio-application.yaml
kubectl apply -f argocd-rollout-app/argocd/application.yaml
```

### 4. Acessar o ArgoCD UI

```bash
# Port-forward para acessar a UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Obter senha inicial do admin
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

Acesse: https://localhost:8080
- **Usuário**: admin
- **Senha**: (obtida no comando acima)

## 🔄 Workflow de Deploy com Canary

### Como Funciona

1. **ArgoCD** detecta mudanças no Git e sincroniza automaticamente
2. **Argo Rollouts** gerencia a estratégia de canary:
   - 20% do tráfego → canary (pausa manual)
   - 40% do tráfego → canary (pausa manual)
   - 60% do tráfego → canary (pausa manual)
   - 80% do tráfego → canary (pausa manual)
   - 100% do tráfego → promove para stable

### Promover Canary Manualmente

```bash
# Ver status do rollout
kubectl argo rollouts get rollout meu-app-rollout -n app

# Promover canary para próxima etapa
kubectl argo rollouts promote meu-app-rollout -n app

# Abortar rollout (volta para versão stable)
kubectl argo rollouts abort meu-app-rollout -n app

# Acessar dashboard do Argo Rollouts
kubectl argo rollouts dashboard
```

### Atualizar a Imagem da Aplicação

Para fazer um novo deploy, edite o arquivo `base/rollout.yaml` no Git:

```yaml
spec:
  template:
    spec:
      containers:
      - name: rollout-gateway
        image: lmacademy/simple-color-app:2.0.0  # Nova versão
```

O ArgoCD detectará a mudança e o Argo Rollouts iniciará o canary deployment automaticamente.

## 📊 Monitoramento

### Verificar Status no ArgoCD

```bash
# CLI do ArgoCD
argocd app get meu-app

# Ver logs de sync
argocd app logs meu-app
```

### Verificar Status do Rollout

```bash
# Watch em tempo real
kubectl argo rollouts get rollout meu-app-rollout -n app --watch

# Ver histórico de revisões
kubectl argo rollouts history meu-app-rollout -n app
```

### Verificar Tráfego no Istio

```bash
# Ver VirtualService
kubectl get virtualservice app-vs -n app -o yaml

# Ver distribuição de tráfego
kubectl get virtualservice app-vs -n app -o jsonpath='{.spec.http[0].route}'
```

## 🛠️ Customização

### Ajustar Estratégia de Canary

Edite `base/rollout.yaml` para modificar os steps do canary:

```yaml
strategy:
  canary:
    steps:
    - setWeight: 10        # Ajuste os percentuais
    - pause: {duration: 30s}  # Adicione pausas automáticas
    - setWeight: 50
    - pause: {}            # Pausa manual
```

### Adicionar Análise Automática

Você pode adicionar análise automática para promover ou abortar baseado em métricas:

```yaml
strategy:
  canary:
    analysis:
      templates:
      - templateName: success-rate
      startingStep: 2
```

## 🔐 Boas Práticas

1. **Use namespaces separados** para cada ambiente (dev, staging, prod)
2. **Configure RBAC** no ArgoCD para controlar acessos
3. **Habilite Automated Sync** apenas após testes em ambientes inferiores
4. **Use Kustomize overlays** para customizações por ambiente
5. **Configure alertas** no Prometheus para falhas no rollout
6. **Mantenha versões** das imagens com tags semânticas (não use `latest`)

## 📚 Recursos Úteis

- [Documentação ArgoCD](https://argo-cd.readthedocs.io/)
- [Documentação Argo Rollouts](https://argoproj.github.io/argo-rollouts/)
- [Istio Traffic Management](https://istio.io/latest/docs/concepts/traffic-management/)
- [Kustomize](https://kustomize.io/)

## 🐛 Troubleshooting

### Application não sincroniza

```bash
# Forçar sync manual
kubectl patch app meu-app -n argocd -p '{"metadata": {"annotations":{"argocd.argoproj.io/refresh":"hard"}}}' --type merge

# Ver eventos
kubectl get events -n app --sort-by='.lastTimestamp'
```

### Rollout travado

```bash
# Ver detalhes
kubectl argo rollouts get rollout meu-app-rollout -n app

# Abortar e voltar para stable
kubectl argo rollouts abort meu-app-rollout -n app
kubectl argo rollouts undo meu-app-rollout -n app
```

### Istio não roteia tráfego corretamente

```bash
# Verificar configuração do Istio
istioctl analyze -n app

# Ver logs do Istio Ingress Gateway
kubectl logs -n istio-system -l app=istio-ingressgateway
```
