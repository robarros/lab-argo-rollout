# Versões disponíveis da imagem argoproj/rollouts-demo

## Cores principais (para teste de rollout visual)
- `blue` (azul)
- `green` (verde)
- `yellow` (amarelo)
- `orange` (laranja)
- `purple` (roxo)
- `red` (vermelho)

## Variantes especiais

### Versões lentas (slow)
Simulam inicialização lenta:
- `slow-blue`
- `slow-green`
- `slow-yellow`
- `slow-orange`
- `slow-purple`
- `slow-red`

### Versões com falha (bad)
Simulam erros/falhas:
- `bad-blue`
- `bad-green`
- `bad-yellow`
- `bad-orange`
- `bad-purple`
- `bad-red`

## Outras versões
- `latest` - Última versão
- `v1-green` - Versão específica

## Uso
Para testar o canary deployment, altere a imagem em rollouts.yaml:
```yaml
image: argoproj/rollouts-demo:green
```

O Argo Rollouts fará o deployment gradual conforme os steps configurados (20% → 50% → 100%).
