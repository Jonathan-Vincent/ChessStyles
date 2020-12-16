// --- Begin Example JS --------------------------------------------------------
// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js

function switchTab(evt, tabName) {
  if (tabName != boardTab){
    playing = false
  }
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("initBoard").click();

var board = null
var game = new Chess()
var mypgn = currentPGN.split(' ')
var pos = 0
var $pgn = $('#pgn')
var playing = false

function makeNextMove () {
  if (pos == mypgn.length) return

  var NextMove = mypgn[pos]

  game.move(NextMove)
  board.position(game.fen())
  pos++;
  predictPGN(mypgn.slice(0,pos))
  $pgn.html(game.pgn())
}

function play () {
  if (playing) {
    playing = false
  }else
  {
  playing = true
  iterate()
}
}

function iterate () {
  if (playing) {
  makeNextMove()
  if (pos >= mypgn.length) {
    playing = false
    return}
  setTimeout(iterate, 500)
}
}

function undoMove () {
  if (pos < 1) return

  game.undo()
  board.position(game.fen())
  pos--;
  predictPGN(mypgn.slice(0,pos))
  $pgn.html(game.pgn())
}

function returnToStart () {

  game.reset()
  board.position(game.fen())
  pos = 0
  predictPGN(mypgn.slice(0,pos))
  $pgn.html(game.pgn())
}

function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

  updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

function updateStatus () {

  var moveColor = 'White'
  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  mypgn = game.history()
  predictPGN(mypgn)

  $pgn.html(game.pgn())
  pos++
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}
board = Chessboard('myBoard', config)

$('#Prev').on('click', undoMove)
$('#Play').on('click', play)
$('#Next').on('click', makeNextMove)
$('#startPositionBtn').on('click', returnToStart)
document.getElementById("defaultOpen").click();
// --- End Example JS ----------------------------------------------------------
