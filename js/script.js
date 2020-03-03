let myGamesList = [];
let genreList = [];
let tagList = [];

listGenres("https://api.rawg.io/api/genres?page_size=40");
listTags("https://api.rawg.io/api/tags?page_size=40");

let inputCount = 5;
inputCount += genreList.length;
inputCount += tagList.length;
let brain = new NeuralNetwork([inputCount, 20, 10, 1]);


function listGenres(url){
    let genreRequest = new XMLHttpRequest;
    genreRequest.open("GET", url, false);
    genreRequest.onload = function(){
        let data = JSON.parse(this.response);

        data.results.forEach(genre => {
            genreList.push(genre.id);
        });

        if(data.next)
            listGenres(data.next);
    };
    genreRequest.send();
}

function listTags(url){
    let tagRequest = new XMLHttpRequest;
    tagRequest.open("GET", url, false);
    tagRequest.onload = function(){
        let data = JSON.parse(this.response);

        data.results.forEach(tag => {
            if(tag.games_count > 100)
                tagList.push(tag.id);
        });

        if(data.next)
            listTags(data.next);
    };
    tagRequest.send();
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/*function loadLocalJSON(){
    let JSONrequest = new XMLHttpRequest
    JSONrequest.overrideMimeType("application/json");

    let URL = "https://api.rawg.io/api/games"

    JSONrequest.open("GET", "myGames.json", true)
    JSONrequest.onload = function(){
        myGamesList = JSON.parse(this.response)

        
    }
    JSONrequest.send()
}

function saveLocalJSON(){

}*/

function loadNewGame(){
    findNewGame("https://api.rawg.io/api/games", myGamesList);
}

function findNewGame(URL, gameList){
    let APIrequest = new XMLHttpRequest;

    APIrequest.open("GET", URL, true);
    APIrequest.onload = function(){
        let data = JSON.parse(this.response);

        let foundNew = false;

        data.results.some(game => {
            let isNew = true;
            gameList.some(myGame => {
                if(game.id === myGame.id || game.tba){
                    isNew = false;
                    return true;
                }
            });

            if(isNew){
                foundNew = true;

                let input = [];

                document.getElementById("game_name").innerText = game.name;
                document.getElementById("game_screenshot").setAttribute("src", game.background_image);
                
                let shortScreenshotsHTML = "";
                game.short_screenshots.forEach(screen => {
                    shortScreenshotsHTML += "<img style='width: 20em;' src='" + screen.image + "'>";
                });
                document.getElementById("game_short_screenshots").innerHTML = shortScreenshotsHTML;

                document.getElementById("game_rating").innerText = game.rating;
                input.push(game.rating?game.rating:0);

                /*let ratingsHTML = "";
                game.ratings.forEach(rating =>{
                    ratingsHTML += "<li>" + rating.title + " : " + rating.count + "</li>";
                    input.push(rating.count?rating.count:0);
                });
                document.getElementById("game_ratings_details").innerHTML = ratingsHTML;*/

                document.getElementById("game_rating_top").innerText = game.rating_top;
                input.push(game.rating_top?game.rating_top:0);

                document.getElementById("game_ratings_count").innerText = game.ratings_count;
                input.push(game.ratings_count?game.ratings_count:0);

                document.getElementById("game_metacritic").innerText = game.metacritic;
                input.push(game.metacritic?game.metacritic:0);

                document.getElementById("game_added").innerText = game.added;
                input.push(game.added?game.added:0);

                /*document.getElementById("game_status_yet").innerText = game.added_by_status.yet;
                input.push(game.added_by_status.yet);

                document.getElementById("game_status_owned").innerText = game.added_by_status.owned;
                input.push(game.added_by_status.owned);

                document.getElementById("game_status_beaten").innerText = game.added_by_status.beaten;
                input.push(game.added_by_status.beaten);

                document.getElementById("game_status_toplay").innerText = game.added_by_status.toplay;
                input.push(game.added_by_status.toplay);

                document.getElementById("game_status_dropped").innerText = game.added_by_status.dropped;
                input.push(game.added_by_status.dropped);

                document.getElementById("game_status_playing").innerText = game.added_by_status.playing;
                input.push(game.added_by_status.playing);*/
                
                let inputGenre = [];
                genreList.forEach(genre => {
                    inputGenre.push(0);
                })

                let genresHTML = "";
                game.genres.forEach(genre => {
                    genresHTML += "<li>" + genre.name + "</li>";

                    for(let i=0; i<genreList.length; i++){
                        if(genreList[i] === genre.id){
                            inputGenre[i] = 1;
                        }
                    }
                });
                document.getElementById("game_genres").innerHTML = genresHTML;

                let inputTag = [];
                tagList.forEach(tag => {
                    inputTag.push(0);
                })

                let tagsHTML = "";
                game.tags.forEach(tag => {
                    for(let i=0; i<tagList.length; i++){
                        if(tagList[i] === tag.id){
                            inputTag[i] = 1;
                            tagsHTML += "<li>" + tag.name + "</li>";
                        }
                    }
                });
                document.getElementById("game_tags").innerHTML = tagsHTML;

                input = input.concat(inputGenre);
                input = input.concat(inputTag);

                let oldYesButton = document.getElementById("game_yes_button");
                let newYesButton = oldYesButton.cloneNode(true);
                newYesButton.addEventListener("click", function(){
                    saveGame(game.id, false, true, input);
                    loadNewGame();
                });
                oldYesButton.parentNode.replaceChild(newYesButton, oldYesButton);

                let oldNoButton = document.getElementById("game_no_button");
                let newNoButton = oldNoButton.cloneNode(true);
                newNoButton.addEventListener("click", function(){
                    saveGame(game.id, false, false, input);
                    loadNewGame();
                });
                oldNoButton.parentNode.replaceChild(newNoButton, oldNoButton);

                let oldPassButton = document.getElementById("game_pass_button");
                let newPassButton = oldPassButton.cloneNode(true);
                newPassButton.addEventListener("click", function(){
                    saveGame(game.id, true, false, input);
                    loadNewGame();
                });
                oldPassButton.parentNode.replaceChild(newPassButton, oldPassButton);

                let guess = brain.feedforward(input);
                let guessTxt;

                if(guess >= (2/3))
                    guessTxt = "Yes";
                else if(guess <= (1/3))
                    guessTxt = "No";
                else
                    guessTxt = "Unknown"
                
                document.getElementById("brain_prediction").innerText = "" + guess + " => " + guessTxt;
            }

            return isNew;
        });

        if(!foundNew)
            findNewGame(data.next, gameList);
    }

    APIrequest.send();
}

function saveGame(id, pass, fav, input){
    gameToSave = {
        id:id,
        pass:pass,
        fav:fav,
        input:input
    }
    myGamesList.push(gameToSave);

    let trainingCount = 0;

    if(myGamesList.length === 10)
        trainingCount = 10000;
    else if(myGamesList.length > 10)
        trainingCount = 100;

    let i = 0;
    while(i < trainingCount){
        shuffle(myGamesList);

        myGamesList.forEach(game => {
            if(!game.pass){
                let target = game.fav ? [1] : [0];
                brain.train(game.input, target);

                i += 1;
            }
        });
    }
}