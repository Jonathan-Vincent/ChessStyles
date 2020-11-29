// --- Begin Example JS --------------------------------------------------------
// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js

var board = null
var game = new Chess()
var mypgn = ('Nc3 h5 Nb1 h4 Nc3 Rh5 Nb1').split(' ')
var pos = 0
var $fen = $('#fen')
var $pgn = $('#pgn')

function makeNextMove () {
  if (pos == mypgn.length) return
  console.log(pos,mypgn[pos])

  var NextMove = mypgn[pos]

  game.move(NextMove)
  board.position(game.fen())
  pos++;
  $fen.html(game.fen())
  $pgn.html(game.pgn())
}

function undoMove () {
  if (pos < 1) return
  console.log(pos,mypgn[pos])

  game.undo()
  board.position(game.fen())
  pos--;
  $fen.html(game.fen())
  $pgn.html(game.pgn())
}

function returnToStart () {
  console.log(pos,mypgn[pos])

  game.reset()
  board.position(game.fen())
  pos = 0
  $fen.html(game.fen())
  $pgn.html(game.pgn())
}

board = Chessboard('myBoard', 'start')

$('#Next').on('click', makeNextMove)
$('#Prev').on('click', undoMove)
$('#startPositionBtn').on('click', returnToStart)
// --- End Example JS ----------------------------------------------------------
