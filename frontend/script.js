var socket = io('http://localhost:3000')

var cards = document.querySelector("div.cards")

var deck = []

var playerTurn = 0

var turn = 0

var lastCard

var color

socket.on('playercount', value => {
    document.querySelector("div.waiting p.text").innerText = `Waiting for players (${value})`
})

socket.on('blocked', function(){
    document.querySelector("div.waiting p.text").innerText = `Maximum number achieved`
    document.querySelector("div.waiting button").style.display = "none"
})

socket.on('deck', newdeck => {
    console.log(newdeck)
    deck = newdeck
    document.querySelector("div.waiting").style.display = "none"
    renderDeck()
})

socket.on('playerturn', value => {
    playerTurn = value
    console.log(playerTurn)
})

socket.on('turn', value => {
    turn = value
    if(turn == playerTurn){
        cards.classList.add("yourturn")
    }else{
        cards.classList.remove("yourturn")
    }
})

socket.on('lastcard', last => {
    lastCard = last
    color = lastCard.color
    document.querySelector("div.mount").innerHTML = `<div class="lastcard ${color} value-${lastCard.value} index-i">${lastCard.value}</div>`
    document.querySelector("div.mount").innerHTML += `<p class="currentcolor">Color: ${color}</p>`
})

socket.on('over', function(){
    document.body.innerHTML = `${deck.length == 0 ? "You won!" : "Game over"}`
})

socket.on('updatecolor', value => {
    color = value
    document.querySelector("div.mount p.currentcolor").innerText = `Color: ${color}`
})

document.querySelector("div.waiting button").addEventListener('click', function(){
    console.log("starting")
    socket.emit('start')
})

function renderDeck(){
    cards.innerHTML = ""
    for(let i = 0; i < deck.length; i++){
        cards.innerHTML += `<div class="card ${deck[i].color} value-${deck[i].value} index-${i}">${deck[i].value}</div>`
    }
}

var indexToMove

cards.addEventListener('click', e => {
    if(!e.target.classList.contains('card')) return
    if(playerTurn != turn) return
    console.log(lastCard)
    if(color == e.target.classList[1] || lastCard.value == e.target.classList[2].replace("value-","") || e.target.classList[1] == "black"){
        if(e.target.classList[1] == "black"){
            indexToMove = parseInt(e.target.classList[3].replace("index-",""))
            document.querySelector("div.colorselect").style.display = "flex"
        }else{
            socket.emit('move', parseInt(e.target.classList[3].replace("index-","")))
        }
    }
})

function selectRed(){
    socket.emit('move', indexToMove)
    socket.emit('color', "red")
    document.querySelector("div.colorselect").style.display = "none"
}

function selectGreen(){
    socket.emit('move', indexToMove)
    socket.emit('color', "green")
    document.querySelector("div.colorselect").style.display = "none"
}

function selectBlue(){
    socket.emit('move', indexToMove)
    socket.emit('color', "blue")
    document.querySelector("div.colorselect").style.display = "none"
}

function selectYellow(){
    socket.emit('move', indexToMove)
    socket.emit('color', "yellow")
    document.querySelector("div.colorselect").style.display = "none"
}

function buy(){
    if(playerTurn != turn) return
    socket.emit('buy')
}