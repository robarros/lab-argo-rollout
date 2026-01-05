import http from 'k6/http';

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 50,              // 10 requisições
      timeUnit: '1s',        // por segundo
      duration: '60m',        // duração do teste
      preAllocatedVUs: 5,   // usuários virtuais alocados inicialmente
      maxVUs: 20,            // limite máximo de usuários
    },
  },
};

// export default function () {
//   http.get('http://k8s-default-nginx-7a9d1cd726-3d9f7dad04599f8c.elb.us-east-1.amazonaws.com');
// }

export default function () {
  http.get('https://api.virtualti.net/vendas');
}

//k6 run k6-teste.js