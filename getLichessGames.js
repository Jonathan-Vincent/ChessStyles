
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const options = {
  url: 'https://lichess.org/api/games/user/username',
  method: 'GET',
  params:{"max":5},
  headers:{"Accept": "application/x-ndjson"}
};

axios(options)
  .then(async response => {
    var data = response.data.split('\n')
    console.log(data)
    console.log(typeof data)
    await sleep(2000)
    for(var i=0, n=data.length-1;i<n;i++) {
      await sleep(1000)
      ligame = JSON.parse(data[i])
      console.log(ligame)
      inputPGN = ligame.moves
      console.log(inputPGN)
      document.getElementById("userInput").value = inputPGN
      document.getElementById("submitted").click();
    }
  });
