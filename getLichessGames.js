
function getLichessGames() {

username = document.getElementById("usernameInput").value

document.getElementById("usernameResult").innerHTML = 'Loading games...'

const options = {
  url: 'https://lichess.org/api/games/user/' + username,
  method: 'GET',
  params:{"max":50,'color':'white'},
  headers:{"Accept": "application/x-ndjson"}
};

axios(options)
.catch(function (error) {document.getElementById("usernameResult").innerHTML = 'Loading failed'})
  .then(response => {
    console.log(response.status)
    var data = response.data.split('\n')
    var userGamesList = []
    document.getElementById("usernameResult").innerHTML = 'Loading successful'
    for(var i=0, n=data.length-1;i<n;i++) {
      ligame = JSON.parse(data[i])
      inputPGN = ligame.moves
      console.log(inputPGN)
      userGamesList = userGamesList.concat([inputPGN])
    }
    var numgames = userGamesList.length
    importUserGames(userGamesList)
    document.getElementById("usernameResult").innerHTML = 'Imported ' + numgames.toString() + ' games'
  }
)

}
