const axios = require('axios'),
  fs = require('fs'),
  http = require('https'),
  Stream = require('stream').Transform;

async function main() {
  try {
    const year = (new Date()).getFullYear()
    const pathname = 'temporada'

    if (!fs.existsSync(pathname)) {
      fs.mkdirSync(pathname)
    }

    const status = (await axios.get('https://api.cartolafc.globo.com/mercado/status')).data

    //Salva os dados das partidas por rodada

    if (!fs.existsSync(`${pathname}/partidas`)) {
      fs.mkdirSync(`${pathname}/partidas`)
    }

    for (let i = 1; i <= 38; i++) {
      if (!fs.existsSync(`${pathname}/partidas/${i}`)) {
        fs.mkdirSync(`${pathname}/partidas/${i}`)
      }

      const partidas = (await axios.get(`https://api.cartolafc.globo.com/partidas/${i}`)).data

      console.log(`Salvando dados da rodada ${i}`)

      fs.writeFileSync(`${pathname}/partidas/${i}/atual.json`, JSON.stringify(partidas))
      fs.writeFileSync(`${pathname}/partidas/${i}/${Date.now()}.json`, JSON.stringify(partidas))

      if (!fs.existsSync(`${pathname}/clubes`)) {
        fs.mkdirSync(`${pathname}/clubes`)
      }

      if (!fs.existsSync(`${pathname}/clubes/escudos`)) {
        fs.mkdirSync(`${pathname}/clubes/escudos`)
      }

      const clubes = Object.entries(partidas.clubes)

      for (let i = 0; i < clubes.length; i++) {
        const clube = clubes[i][1]
        const ext = String(clube.escudos["60x60"]).split('.').reverse()[0]

        http.request(clube.escudos['60x60'], function (response) {
          var data = new Stream();

          response.on('data', function (chunk) {
            data.push(chunk);
          });

          response.on('end', function () {
            fs.writeFileSync(`${pathname}/clubes/escudos/${clube.id}.${ext}`, data.read());
          });
        }).end();
      }
    }

    //Salva os dados dos atletas

    if (!fs.existsSync(`${pathname}/atletas`)) {
      fs.mkdirSync(`${pathname}/atletas`)
    }

    if (!fs.existsSync(`${pathname}/atletas/avatares`)) {
      fs.mkdirSync(`${pathname}/atletas/avatares`)
    }

    const jogadores = (await axios.get('https://api.cartolafc.globo.com/atletas/mercado')).data

    console.log(`Salvando dados dos atletas`)

    fs.writeFileSync(`${pathname}/atletas/atual.json`, JSON.stringify(jogadores))
    fs.writeFileSync(`${pathname}/atletas/${Date.now()}.json`, JSON.stringify(jogadores))

    const atletas = jogadores.atletas

    for (let i = 0; i < atletas.length; i++) {
      const atleta = atletas[i]
      const ext = String(atleta.foto).split('.').reverse()[0]

      try {
        http.request(atleta.foto.replace('FORMATO', '140x140'), function (response) {
          var data = new Stream();

          response.on('data', function (chunk) {
            data.push(chunk);
          });

          response.on('end', function () {
            fs.writeFileSync(`${pathname}/atletas/avatares/${atleta.atleta_id}.${ext}`, data.read());
          });
        }).end();
      } catch (error) {
        //
      }
    }

    //Salva os dados dos clubes

    if (!fs.existsSync(`${pathname}/clubes`)) {
      fs.mkdirSync(`${pathname}/clubes`)
    }

    const clubes = (await axios.get('https://api.cartolafc.globo.com/clubes')).data

    console.log(`Salvando dados dos clubes`)

    fs.writeFileSync(`${pathname}/clubes/atual.json`, JSON.stringify(clubes))
    fs.writeFileSync(`${pathname}/clubes/${Date.now()}.json`, JSON.stringify(clubes))

    //Salva informações das rodadas

    const rodadas = (await axios.get('https://api.cartolafc.globo.com/rodadas')).data

    console.log(`Salvando informações das rodadas`)

    fs.writeFileSync(`${pathname}/rodadas.json`, JSON.stringify(rodadas))
  } catch (error) {
    console.log(error)
  }

  console.log('Fim')
}

main()