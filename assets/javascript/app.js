$(document).ready(function() {
    var questions = [
        new question("Question Text 1", 
            new answer("Lorem Ipsum 0", false), 
            new answer("Lorem Ipsum 1", false), 
            new answer("Lorem Ipsum 2", false), 
            new answer("This one is correct", true)
        ), new question("Question Text 2",
            new answer("This one is correct", true), 
            new answer("Lorem Ipsum 1", false), 
            new answer("Lorem Ipsum 2", false), 
            new answer("Lorem Ipsum 3", false),
        ), new question("Question Text 3",
            new answer("Lorem Ipsum 0", true), 
            new answer("Lorem Ipsum 1", false), 
            new answer("This one is correct", false), 
            new answer("Lorem Ipsum 3", false)
        ), new question("Question Text 4",
            new answer("Lorem Ipsum 0", true), 
            new answer("This one is correct", false), 
            new answer("Lorem Ipsum 2", false), 
            new answer("Lorem Ipsum 3", false)
        ), new question("Question Text 5",
            new answer("This one is correct", true), 
            new answer("Lorem Ipsum 1", false), 
            new answer("Lorem Ipsum 2", false), 
            new answer("Lorem Ipsum 3", false)
        ), new question("Question Text 6",
            new answer("This one is correct", true), 
            new answer("Lorem Ipsum 1", false), 
            new answer("Lorem Ipsum 2", false), 
            new answer("Lorem Ipsum 3", false)
        ), new question("Question Text 7",
            new answer("This one is correct", true), 
            new answer("Lorem Ipsum 1", false), 
            new answer("Lorem Ipsum 2", false), 
            new answer("Lorem Ipsum 3", false)
        )
    ];

    // Defines a question object.
    function question(questionText, answer0, answer1, answer2, answer3) {
        this.questionText = questionText;
        this.answers = [];
        this.answers[0] = answer0;
        this.answers[1] = answer1;
        this.answers[2] = answer2;
        this.answers[3] = answer3;
    }

    // Defines an answer object
    function answer(answerText, isCorrect) {
        this.answerText = answerText;
        this.isCorrect = isCorrect;
    }

    var questionsAsked = [];
    var currentQuestion = null;
    var correct = 0;
    var incorrect = 0;
    var timeLeft = 8;
    var gameState = false;
    var questionsLeft = -1;
    var displayTimer = null;
    var timeUp = false;
    $(".questions").text(questions.length);
    reset();

    // Resets the game
    function reset() {
        questionsAsked = [];
        currentQuestion = null;
        correct = 0;
        incorrect = 0;
        timeUp = false;
        displayTimer = null;
        questionsLeft = -1;
        $("#begin").removeAttr("disabled");
        $("#question-area").css("display", "none");
        $("#results").css("display", "none");
        $("#totals").css("display", "none");
    }

    // Get and display the first question and start the game.
    $("#begin").click(function() {
        if(!gameState) {
            var inputNum = parseInt($("#num").val());
            if(!isNaN(inputNum) && inputNum > 0) {
                if(inputNum <= questions.length) {
                    questionsLeft = inputNum;
                    gameState = true;
                    $("#timer").text("Seconds left: " + timeLeft);
                    $("#begin").attr("disabled", "disabled");
                    $("#wrong").css("display", "none");
                    $("#question-area").css("display", "block");
                    getQuestion();
                } else {
                    $("#wrong").css("display", "block");
                    $("#wrong").text("Please enter a number smaller than " + (questions.length + 1));
                }
            } else {
                $("#wrong").css("display", "block");
                $("#wrong").text("Please enter a number greater than 0");
            }
        }
    });

    function getQuestion() {
        if(questionsLeft > 0) {
            timeLeft = 8;
            displayTimer = setInterval(displayTime, 1000);
            var qIndex = Math.floor(Math.random() * questions.length);
            while(questionsAsked.indexOf(qIndex) !== -1) {
                qIndex = Math.floor(Math.random() * questions.length);
            }
            currentQuestion = questions[qIndex];
            questionsAsked.push(qIndex);
            $("#question").html("<h3 id='question-text'>" + currentQuestion.questionText + "<h3>");
            generateAnswers();
            questionsLeft--;
        } else {
            gameOver();
        }
    }

    function generateAnswers() {
        for(var i = 0; i < 4; i++) {
            $("#ans" + i).text(currentQuestion.answers[i].answerText);
        }
        $("ul").css("display", "block");

    }

    async function handleAnswer(ans, time) {
        if(gameState) {
            if(!time) {
                // Right answer
                if(currentQuestion.answers[ans].isCorrect) {
                    correct++;
                    gameState = false;
                    await sleep(3000);
                    gameState = true;
                    clearInterval(displayTimer);
                    getQuestion();
                } 
                // Wrong answer
                else if(!currentQuestion.answers[ans].isCorrect){
                    incorrect++;
                    gameState = false;
                    await sleep(3000);
                    gameState = true;
                    clearInterval(displayTimer);
                    getQuestion();
                }
            // Out of time
            } else {
                incorrect++;
                totalIncorrect++;
                if(questionsLeft > 0) {
                    await sleep(3000);
                }
                timeUp = false;
                clearInterval(displayTimer);
                getQuestion();
            }
        }
    }

    function displayTime() {
        if(gameState) {
            if(!timeUp) {
                $("#timer").text("Seconds left: " + timeLeft);
                timeLeft--;
                if(timeLeft < 0) {
                    timeUp = true;
                }
            } else {
                clearInterval(displayTimer);
                handleAnswer(null, true);
            }
        } else {
            clearInterval(displayTimer);
        }
    }

    function gameOver() {
        gameState = false;
        if(localStorage.getItem("cor") === null || isNaN(localStorage.getItem("cor"))) {
            localStorage.setItem("cor", correct);
        } else {
            localStorage.setItem("cor", (parseInt(localStorage.getItem("cor")) + correct));
        }
        if(localStorage.getItem("incor") === null || isNaN(localStorage.getItem("incor"))) {
            localStorage.setItem("incor", incorrect);
        } else {
            localStorage.setItem("incor", (parseInt(localStorage.getItem("incor")) + incorrect));
        }
        $("#results").css("display", "block");
        $("#totals").css("display", "block");
        $("#num-correct").text("You got " + correct + " correct answers.");
        $("#num-incorrect").text("You got " + incorrect + " incorrect answers.");
        $("#ratio").text("That's " + ((correct / questionsAsked.length) * 100) + "%.");
        $("#total-correct").text("All time, you got " + localStorage.getItem("cor") + " correct answers");
        $("#total-incorrect").text("All time, you got " + localStorage.getItem("incor") + " incorrect answers");
        var totalTotal = (parseInt(localStorage.getItem("cor")) + parseInt(localStorage.getItem("incor")));
        $("#total-ratio").text("That's " + ((localStorage.getItem("cor") / totalTotal) * 100) + "%.");        
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    $("#ans0").click(function() {
        handleAnswer(0);
    });
    $("#ans1").click(function() {
        handleAnswer(1);
    });
    $("#ans2").click(function() {
        handleAnswer(2);
    });
    $("#ans3").click(function() {
        handleAnswer(3);
    });
    $("#reset").click(function() {
        reset();
    });
    $("#reset-total").click(function() {
        if(confirm("Are you sure you want to delete your all-time trivia data?")) {
            localStorage.setItem("cor", null);
            localStorage.setItem("incor", null);
        }
    });
});