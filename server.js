const express = require('express')
const path = require('path')
const { start } = require('repl')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname, 'frontend')))
app.set('views', path.join(__dirname, 'frontend'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

var playerCounter = 0
var players = []
var turn = 0
var direction = 1
var decks = []
var lastCard

app.use('/', (req, res) => {
    res.render('index.html')
})

io.on('connection', socket => {
    console.log(`> Socket connected ${socket.id}`)
    playerCounter++
    var currentSocket = socket.id
    players.push(socket.id)
    io.sockets.emit('playercount', playerCounter)
    socket.on('disconnect', socket => {
        console.log(`> Socket disconnected`)
        players.splice(players.indexOf(currentSocket),1)
        let newPlayers = players.filter(function(value, index, arr){
            return value != currentSocket
        })
        players = newPlayers
        playerCounter--
        io.sockets.emit('playercount', playerCounter)
    })
    socket.on('start', function () {
        if(playerCounter > 1){
            startGame()
        }
    })
    socket.on('color', value => {
        io.sockets.emit('updatecolor', value)
    })
    socket.on('move', i => {
        console.log(decks[players.indexOf(currentSocket)][i])
        lastCard = decks[players.indexOf(currentSocket)][i]
        console.log(lastCard)
        let playerDeck = decks[players.indexOf(currentSocket)].filter(function(value, index, arr){
            return index != i
        })
        decks[players.indexOf(currentSocket)] = playerDeck
        console.log(playerDeck)
        console.log("sending deck")
        console.log(decks[players.indexOf(currentSocket)])
        socket.emit('deck', playerDeck)
        io.sockets.emit('lastcard', lastCard)
        if(playerDeck.length == 0){
            io.sockets.emit('over')
            return
        }
        console.log("sent")
        if(lastCard.value == "reverse"){
            direction = -direction
        }else if(lastCard.value == "block"){
            if(direction == 1){
                turn++
                if(turn > playerCounter - 1){
                    turn = 0
                }
            }else if(direction == -1){
                turn--
                if(turn < 0){
                    turn = playerCounter - 1
                }
            }
        }else if(lastCard.value == "plus2"){
            let indexToAdd = turn
            if(direction == 1){
                indexToAdd++
                if(indexToAdd > playerCounter - 1){
                    indexToAdd = 0
                }
            }else if(direction == -1){
                indexToAdd--
                if(indexToAdd < 0){
                    indexToAdd = playerCounter - 1
                }
            }
            addCard(decks[indexToAdd])
            addCard(decks[indexToAdd])
            io.to(players[indexToAdd]).emit('deck', decks[indexToAdd])
            if(direction == 1){
                turn++
                if(turn > playerCounter - 1){
                    turn = 0
                }
            }else if(direction == -1){
                turn--
                if(turn < 0){
                    turn = playerCounter - 1
                }
            }
        }else if(lastCard.value == "plus4"){
            let indexToAdd = turn
            if(direction == 1){
                indexToAdd++
                if(indexToAdd > playerCounter - 1){
                    indexToAdd = 0
                }
            }else if(direction == -1){
                indexToAdd--
                if(indexToAdd < 0){
                    indexToAdd = playerCounter - 1
                }
            }
            addCard(decks[indexToAdd])
            addCard(decks[indexToAdd])
            addCard(decks[indexToAdd])
            addCard(decks[indexToAdd])
            io.to(players[indexToAdd]).emit('deck', decks[indexToAdd])
            if(direction == 1){
                turn++
                if(turn > playerCounter - 1){
                    turn = 0
                }
            }else if(direction == -1){
                turn--
                if(turn < 0){
                    turn = playerCounter - 1
                }
            }
        }
        if(direction == 1){
            turn++
            if(turn > playerCounter - 1){
                turn = 0
            }
        }else if(direction == -1){
            turn--
            if(turn < 0){
                turn = playerCounter - 1
            }
        }
        
        io.sockets.emit('turn', turn)
    })
    socket.on('buy', function(){
        addCard(decks[players.indexOf(currentSocket)])
        socket.emit('deck', decks[players.indexOf(currentSocket)])
    })
})

var allCardsArray = [{color: "red", value: "0"},{color: "red", value: "1"},{color: "red", value: "2"},{color: "red", value: "3"},{color: "red", value: "4"},{color: "red", value: "5"},{color: "red", value: "6"},{color: "red", value: "7"},{color: "red", value: "8"},{color: "red", value: "9"},{color: "red", value: "block"},{color: "red", value: "block"},{color: "red", value: "reverse"},{color: "red", value: "reverse"},{color: "red", value: "plus2"},{color: "red", value: "plus2"},{color: "yellow", value: "0"},{color: "yellow", value: "1"},{color: "yellow", value: "2"},{color: "yellow", value: "3"},{color: "yellow", value: "4"},{color: "yellow", value: "5"},{color: "yellow", value: "6"},{color: "yellow", value: "7"},{color: "yellow", value: "8"},{color: "yellow", value: "9"},{color: "yellow", value: "block"},{color: "yellow", value: "block"},{color: "yellow", value: "reverse"},{color: "yellow", value: "reverse"},{color: "yellow", value: "plus2"},{color: "yellow", value: "plus2"},{color: "green", value: "0"},{color: "green", value: "1"},{color: "green", value: "2"},{color: "green", value: "3"},{color: "green", value: "4"},{color: "green", value: "5"},{color: "green", value: "6"},{color: "green", value: "7"},{color: "green", value: "8"},{color: "green", value: "9"},{color: "green", value: "block"},{color: "green", value: "block"},{color: "green", value: "reverse"},{color: "green", value: "reverse"},{color: "green", value: "plus2"},{color: "green", value: "plus2"},{color: "blue", value: "0"},{color: "blue", value: "1"},{color: "blue", value: "2"},{color: "blue", value: "3"},{color: "blue", value: "4"},{color: "blue", value: "5"},{color: "blue", value: "6"},{color: "blue", value: "7"},{color: "blue", value: "8"},{color: "blue", value: "9"},{color: "blue", value: "block"},{color: "blue", value: "block"},{color: "blue", value: "reverse"},{color: "blue", value: "reverse"},{color: "blue", value: "plus2"},{color: "blue", value: "plus2"},{color: "black", value: "color"},{color: "black", value: "color"},{color: "black", value: "color"},{color: "black", value: "color"},{color: "black", value: "plus4"},{color: "black", value: "plus4"},{color: "black", value: "plus4"},{color: "black", value: "plus4"}]

var shuffledArray = allCardsArray
shuffledArray = shuffleDeck(shuffledArray)

function shuffleDeck(myArr) {
    let newArr = myArr
    var l = myArr.length, temp, index
    while (l > 0) {
       index = Math.floor(Math.random() * l)
        l--
        temp = newArr[l]
        newArr[l] = newArr[index]
        newArr[index] = temp
    }
    return newArr
}

function startGame(){
    turn = 0
    decks = []
    var canContinue = true
    do{
        lastCard = shuffledArray[Math.floor(Math.random() * shuffledArray.length)]
        if(lastCard.color == "black" || lastCard.value == "block" || lastCard.value == "reverse"){
            canContinue = false
        }else{
            canContinue = true
        }
    }while(!canContinue)
    
    for(let j = 0; j < playerCounter; j++){
        var newDeck = []
        for(let i = 0; i < 7; i++){
            newDeck.push(shuffledArray[Math.floor(Math.random() * shuffledArray.length)])
        }
        decks.push(newDeck)
        console.log(players[j])
        io.to(players[j]).emit('deck', newDeck)
        io.to(players[j]).emit('lastcard', lastCard)
        io.to(players[j]).emit('playerturn', j)
        io.to(players[j]).emit('turn', turn)
    }
    console.log(decks)
}
function addCard(arr){
    arr.push(shuffledArray[Math.floor(Math.random() * shuffledArray.length)])
}

server.listen(3000)