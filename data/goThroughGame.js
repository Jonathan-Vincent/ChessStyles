// --- Begin Example JS --------------------------------------------------------
// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js

var board = null
var game = new Chess()
var mypgn = currentPGN.split(' ')
var pos = 0
var $pgn = $('#pgn')

function makeNextMove () {
  if (pos == mypgn.length) return
  console.log(pos,mypgn[pos])

  var NextMove = mypgn[pos]

  game.move(NextMove)
  board.position(game.fen())
  pos++;
  $pgn.html(game.pgn())
}

function play () {
  makeNextMove()
  if (pos >= mypgn.length) return
  setTimeout(play, 500)
}

function undoMove () {
  if (pos < 1) return
  console.log(pos,mypgn[pos])

  game.undo()
  board.position(game.fen())
  pos--;
  $pgn.html(game.pgn())
}

function returnToStart () {
  console.log(pos,mypgn[pos])

  game.reset()
  board.position(game.fen())
  pos = 0
  $pgn.html(game.pgn())
}

board = Chessboard('myBoard', 'start')

$('#Prev').on('click', undoMove)
$('#Play').on('click', play)
$('#Next').on('click', makeNextMove)
$('#startPositionBtn').on('click', returnToStart)
// --- End Example JS ----------------------------------------------------------
