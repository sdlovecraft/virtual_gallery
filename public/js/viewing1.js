
artGame.viewing1 = function(){};


artGame.viewing1.prototype = {
    preload: function(){
        $.ajax({
            url:'getPlayers',
            type: 'get',
            async: false,
            success: function(playerData){
                players = playerData;
            }
        });


    },

    create: function(){
        console.log("PLAYERS", players);
        //remotePlayers = {};

        socket = io("http://localhost:5000/viewing1");
       $( document ).ready(function() {
            console.log("READY");
            $('.minimized-bar').hide();
            $('form').submit(function(e){


                e.preventDefault();
                socket.emit('chat message', $('#m').val());
                $('#m').val('');
                return false;
              });
            $('.minimize').on('click',function(){
                $('.chat-box').hide();
                $('.minimized-bar').show();
            });
            $('.maximize').on('click',function(){
                $('.chat-box').show();
                $('.minimized-bar').hide();
            });
            socket.on('chat message', function(msg){

                $('#messages').append($('<li>').text(msg));
                $(".message-list").scrollTop($(".message-list")[0].scrollHeight);
            });

        });

        this.facing = "left";
        this.level = 'viewing1';
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.game.stage.backgroundColor = '#ffffff';

        //this.game.add.tileSprite(0, 0, 800, 608, 'viewing1-background');

        this.map =  this.game.add.tileSprite(0, 0, 800, 608, 'viewing1-background');

        //this.map.addTilesetImage('tiles-2');

        //this.map.setCollisionBetween(9, 50);

        //this.layer = this.map.createLayer('Tile Layer 1');

        //  Un-comment this on to see the collision tiles
        // layer.debug = true;


        //this.layer.resizeWorld();

        this.player = this.game.add.sprite(32, 32, 'dude');
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.lastPosition = { x: this.player.x, y: this.player.y };
        this.player.body.drag.set(0.2);
        this.player.body.collideWorldBounds = true;
        this.player.body.setSize(5, 32, 5, 16);
        this.player.position.x = 100;
        this.player.position.y = 300;
        this.player.room = 'viewing1';


        this.player.animations.add('left', [0, 1, 2, 3], 10, true);
        this.player.animations.add('turn', [4], 20, true);
        this.player.animations.add('right', [5, 6, 7, 8], 10, true);

        console.log('remote players',remotePlayers);
        this.initializeRemotePlayers();
        this.game.camera.follow(this.player);

        this.cursors = this.game.input.keyboard.createCursorKeys();
        // jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

         // Start listening for events
        setEventHandlers.bind(this)();
        //createDoors(map);


    },
    initializeRemotePlayers: function(){
        remotePlayers = {};
        for(var id in players){
            var player = players[id];
            if(player.room==="viewing1"){
                console.log("player",player);
                remotePlayers[player.id] = new RemotePlayer(player.id,this.game,player.x,player.y);
            }


        }
    },
    update: function(){



        for (var id in remotePlayers)
        {

            if (remotePlayers[id].alive)
                //could this be done asyncronously?
                remotePlayers[id].update();

        }
        this.game.physics.arcade.collide(this.player, this.layer);
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
        //console.log(this.input.activePointer.x,this.input.activePointer.isDown );

        if (this.cursors.left.isDown )
        {

            this.player.body.velocity.x = -150;
            if (this.facing != 'left')
            {
                this.player.animations.play('left');
                this.facing = 'left';
            }
        }
        else if (this.cursors.right.isDown )
        {
            this.player.body.velocity.x = 150;

            if (this.facing != 'right')
            {
                this.player.animations.play('right');
                this.facing = 'right';
            }
        }
        else if (this.cursors.up.isDown)
        {
            this.player.body.velocity.y = -150;

        }
        else if (this.cursors.down.isDown)
        {
            this.player.body.velocity.y = 150;


        }
        else
        {
            if (this.facing != 'idle')
            {
                this.player.animations.stop();

                if (this.facing == 'left')
                {
                    this.player.frame = 0;
                }
                else
                {
                    this.player.frame = 5;
                }

                this.facing = 'idle';
            }
        }

        if (this.player.lastPosition.x !== this.player.x || this.player.lastPosition.y !== this.player.y){
            socket.emit("move player", {x: this.player.x, y:this.player.y, room:'viewing1'});
        }
        this.player.lastPosition = { x: this.player.x, y: this.player.y };
        }
};

