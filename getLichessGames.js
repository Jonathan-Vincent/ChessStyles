
function getLichessGames() {

username = document.getElementById("usernameInput").value

document.getElementById("usernameResult").innerHTML = 'Loading games...'

if ($('#' + username).length>0){
document.getElementById("usernameResult").innerHTML = 'User already loaded in'
return
}

if (document.getElementsByName('p').length>12){
document.getElementById("usernameResult").innerHTML = 'Cannot load in more players'
return
}
if (reqgames.value>100){
document.getElementById("usernameResult").innerHTML = 'Cannot load more than 100 games'
return
}
console.log(reqgames.value)
const options = {
  url: 'https://lichess.org/api/games/user/' + username,
  method: 'GET',
  params:{"max":reqgames.value,'color':'white'},
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
      userGamesList = userGamesList.concat([inputPGN])
    }
    var numgames = userGamesList.length
    color[username] = favcolor.value
    var newcolor = ('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6)
    favcolor.value = '#' + newcolor
    document.getElementById("usernameResult").innerHTML = 'Imported ' + numgames.toString() + ' games'

    $('#select-player').append('<input type="checkbox" class="checkbox" name="p" id="' +
     username +'" value="'+ username + '" onClick=changeColour(this) />')
    $('#select-player').append('<label for="' + username + '">' + username + '</label>')
    importUserGames(userGamesList)
    $('#' + username).click()

  }
)
}

function changeColour (source) {
username = source.id
if ($('#' + username + ':checked').length>0){
$('#' + username + ':checked ~ label[for="' + username + '"]').css({'background-color':color[username]})
}else{
$('#' + username + ' ~ label[for="' + username + '"]').css({'background-color':'#FFF'})
}
}
