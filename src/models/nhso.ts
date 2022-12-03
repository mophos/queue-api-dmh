
const request = require('request');
export class NhsoModel {

  save(data) {
    return new Promise((resolve: any, reject: any) => {
      const options = {
        method: 'POST',
        url: `http://192.168.44.14/ci_kios/index.php/nhso/visits_post`,
        agentOptions: {
          rejectUnauthorized: false
        },
        headers:
        {
          'content-type': 'text/json'
        },
        body: JSON.stringify(data)
      };

      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }

}
