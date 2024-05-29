var programCode = function(processingInstance) {
  with (processingInstance) {
    size(600, 600);
    frameRate(30);

    //----------------------------------------------
    var Level = 20;
    var l = (Level - 1);
    var keys = {};
    keyPressed = function() {
      keys[keyCode] = true;
    };
    keyReleased = function() {
      delete keys[keyCode];
    };
    //{
    var rectCollide = function(obj1, obj2) {
      return ((obj1.x + obj1.width + 0.1 > obj2.x) && (obj1.x < obj2.x + obj2.width + 0.1) && (obj1.y + obj1.height > obj2.y) && (obj1.y < obj2.y + obj2.height));
    };
    //} Colliders

    var player = function(config) {
      this.x = config.x;
      this.y = config.y;
      this.width = config.width || 20;
      this.height = config.height || 20;
      this.complete = config.complete || false;
      this.dead = config.dead || false;
      this.climbing = config.climbing || false;

      this.checkpoint = 0;
      this.xkb = 0;
      this.xVelocity = 0;
      this.yVelocity = 5;
      this.yAcceleration = 0.2;
      this.jumpCharge = 1;
    };
    player.prototype.display = function() {
      fill(255, 255, 255);
      rect(this.x, this.y, this.width, this.height);

      if (this.y <= 0 && Level % 10 != 0) {
        this.complete = true;
      }
      if (this.y >= 600) {
        this.dead = true;
      }
      this.checkpoint = Math.floor((Level - 1) / 10)
    }
    player.prototype.moveX = function() {
      if (keys[65] && keys[68]) {
        this.xVelocity = 0;
      }
      else if (keys[65]) {
        this.xVelocity -= 5;
      }
      else if (keys[68]) {
        this.xVelocity += 5;
      }
      else {
        this.xVelocity = 0;
      }

      this.xkb -= 0.5 * this.xkb;
      if (Math.abs(this.xkb) < 0.25) {
        this.xkb = 0;
      }

      if (this.xVelocity > 10) {
        this.xVelocity = 10;
      }
      if (this.xVelocity < -10) {
        this.xVelocity = -10;
      }

      this.x += this.xVelocity + this.xkb;
    };
    player.prototype.moveY = function() {
      if (keys[87] && abs(this.yVelocity) < 0.5 && abs(this.yAcceleration) < 0.1 && !this.climbing) {
        this.yVelocity = -15;
        this.jumpCharge = 1;
      }
      else if (keys[87] && this.jumpCharge > 0 && this.yVelocity > 0) {
        this.yVelocity = -15;
        this.jumpCharge -= 1;
      }
      if (keys[83] && this.yVelocity < 9) {
        this.yVelocity += 2;
      }


      if (this.yVelocity < 9) {
        this.yAcceleration = 2;
      } else {
        this.yAcceleration = 0;
      }

      this.y += this.yVelocity;
      this.yVelocity += this.yAcceleration;
    };

    var Players = [];
    //{
    var block = function(config) {
      this.x = config.x;
      this.y = config.y;
      this.width = config.width || 15;
      this.height = config.height || 15;
    };
    block.prototype.display = function() {
      noStroke();
      fill(255, 255, 255);
      rect(this.x, this.y, this.width, this.height);
    };
    block.prototype.collideX = function(object) {
      if (rectCollide(this, object)) {
        if (object.x > this.x) {
          object.x = this.x + this.width;
          object.xVelocity = 0;
        } else {
          object.x = this.x - object.width;
          object.xVelocity = 0;
        }
        object.climbing = true;
        object.jumpCharge = 2;
        object.yVelocity = 0;
      }
    };
    block.prototype.collideY = function(object) {
      if (rectCollide(this, object)) {

        var objectCoordinates = [object.x + (0.5 * object.width), object.y + (0.5 * object.height)];
        var playerCoordinates = [this.x + (0.5 * this.width), this.y + (0.5 * this.height)];
        var vector = [2];
        vector = [playerCoordinates[0] - objectCoordinates[0], playerCoordinates[1] - objectCoordinates[1]];
        var angle = Math.atan2(vector[1], vector[0]);

        if ((angle > (1 / 8) * Math.PI && angle < (7 / 8) * Math.PI) || (angle > -(7 / 8) * Math.PI && angle < -(1 / 8) * Math.PI)) {
          if (object.y > this.y) {
            object.y = this.y + this.height;
            object.yVelocity = 0;
          }
          else {
            object.y = this.y - object.height;
            object.yVelocity = 0;
            object.yAcceleration = 0;
          }
        }
      }
    };

    var Blocks = [];
    //}Block block

    //{
    var lavaBlock = function(config) {
      this.x = config.x;
      this.y = config.y;
      this.width = config.width || 15;
      this.height = config.height || 15;
    };
    lavaBlock.prototype.display = function() {
      noStroke();
      fill(255, 0, 0);
      rect(this.x, this.y, this.width, this.height);
    };
    lavaBlock.prototype.collide = function(object) {
      if (rectCollide(this, object)) {
        object.dead = true;
      }
    };
    var lavaBlocks = [];
    //} Lava block

    var enemy1 = function(config) {
      this.x = config.x;
      this.y = config.y;
      this.width = config.width || 80;
      this.height = config.height || 80;
      this.health = config.health || 0;
      this.patience = config.patience || 200;
      this.chaseTime = 0;
      this.chaseSet = config.chaseSet || false;
      this.xVelocity = 0;
      this.yVelocity = 5;
    };

    enemy1.prototype.display = function() {
      this.y = constrain(this.y, 50, height - this.height - 50);
      this.x = constrain(this.x, 10, width - (0.5 * this.width) - 50);
      noStroke();
      fill(255, 0, 0);
      rect(this.x, this.y, this.width, this.height);
      rect(50, 10, this.health * 10, 30);
      fill(255, 255, 255);
      rect(this.x + 10, this.y + 20, this.width / 5, this.height / 5);
      rect(this.x + this.width - (10 + this.width / 5), this.y + 20, this.width / 5, this.height / 5);
      rect(this.x + 10, this.y + 55, this.width - 20, this.height / 8);
    };
    enemy1.prototype.collide = function(object) {
      if (rectCollide(this, object)) {
        if (object.y > this.y + 10) {
          object.dead = true;
        }
        else {
          this.health -= 1;
          object.yVelocity = -25;
          if (this.x > object.x) {
            object.xkb -= 15;
          }
          else {
            object.xkb += 15;
          }
        }
        if (this.health == 0) {
          object.complete = true;
        }
      }
    }
    enemy1.prototype.move = function(object) {
      var thisCoordinates = [this.x + (0.5 * this.width), this.y + (0.5 * this.height)];
      var playerCoordinates = [object.x + (0.5 * object.width), object.y + (0.5 * object.height)];
      var vector = [2];
      vector = [playerCoordinates[0] - thisCoordinates[0], playerCoordinates[1] - thisCoordinates[1]];
      var angle = Math.atan2(vector[1], vector[0]);
      if (this.chaseSet == false) {
        if (object.y > this.y || this.y > 200) {
          this.xVelocity = 5 * Math.cos(angle);
          this.yVelocity = 5 * Math.sin(angle);
        }
        else {
          this.patience = 0;
        }
        this.patience -= 1;

        if (this.patience <= 0) {
          if (object.y > this.y || this.y > 150) {
            this.xVelocity = 7.5 * Math.cos(angle);
            this.yVelocity = 7.5 * Math.sin(angle);
          }
          else {
            angle += random(-0.5 * Math.PI, 0.5 * Math.PI);
            this.xVelocity = -7.5 * Math.cos(angle);
            this.yVelocity = -7.5 * Math.sin(angle);
          }
          this.chaseTime = random(50, 100);
          if (this.y > 60) {
            angle += random(-0.5 * Math.PI, 0.5 * Math.PI);
            this.xVelocity = -7.5 * Math.cos(angle);
            this.yVelocity = -7.5 * Math.sin(angle);
          }
          if (this.y < 500) {
            this.xVelocity = 7.5 * Math.cos(angle);
            this.yVelocity = 7.5 * Math.sin(angle);
          }
          this.chaseSet = true;
        }
      }
      else {
        this.chaseTime -= 1;
        if (this.x > 505 || this.x < 15) {
          this.xVelocity = -this.xVelocity;
          this.yVelocity = -this.yVelocity;
        }
        if (this.y > 459 || this.y < 75) {
          this.xVelocity = -this.xVelocity;
          this.yVelocity = -this.yVelocity;
        }
        if (this.chaseTime <= 0) {
          this.patience = random(200, 350);
          this.chaseSet = false;
        }
      }



      this.x += this.xVelocity;
      this.y += this.yVelocity;
    }

    var Enemy1s = [];

    var enemy2 = function(config) {
      this.x = config.x;
      this.y = config.y;
      this.img = loadImage("https://static.wikia.nocookie.net/among-us-wiki/images/3/31/Red.png");
      this.img2 = loadImage("https://static.wikia.nocookie.net/pilgrammed-rblx/images/d/dc/Harpoon.png");
      this.img3 = loadImage("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJvxXofZIHMAyKzAr03TjTEw2Y80ocQPFiX1QzJ05OXjPO9AaSFupbug1WFL6SXy05E7o:https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/cb419721-2136-495b-af22-a633dcb2e6c6/dfmzjvc-195ea495-c583-4793-9e2c-077e6635231a.png%3Ftoken%3DeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2NiNDE5NzIxLTIxMzYtNDk1Yi1hZjIyLWE2MzNkY2IyZTZjNlwvZGZtemp2Yy0xOTVlYTQ5NS1jNTgzLTQ3OTMtOWUyYy0wNzdlNjYzNTIzMWEucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.Vl5th56gH5ZvFPlS_DhuZqNCr9mUngB_zJOvZ2Lf0cw&usqp=CAU");
      this.width = config.width || 40;
      this.height = config.height || 60;
      this.health = config.health || 0;
      this.crossed = config.crossed || false;
      this.patience = config.patience || 200;
      this.chaseTime = 0;
      this.targetPos = config.targetPos || [];
      this.chaseSet = config.chaseSet || false;
      this.xVelocity = 0;
      this.yVelocity = 5;
    };
    enemy2.prototype.display = function() {
      this.y = constrain(this.y, 50, height - this.height - 50);
      this.x = constrain(this.x, 10, width - (0.5 * this.width) - 50);
      if (!this.crossed) {
        noStroke();
        image(this.img, this.x - 25, this.y - 20, this.width + 50, this.height + 40);
        image(this.img2, this.x - 25, this.y - 20, this.width + 50, this.height + 40);
        fill(255, 0, 0);
        rect(50, 10, this.health * 12.5, 30); rect(this.targetPos[0], this.targetPos[1], this.width, this.height);
      }
      else {
        image(this.img3, this.x - 25, this.y - 25, this.width + 50, this.height + 40);
        fill(255, 0, 0);
        rect(50, 10, this.health * 12.5, 30);
      }
    };
    enemy2.prototype.collide = function(object) {
      if (rectCollide(this, object)) {
        if (object.y > this.y + 10) {
          object.dead = true;
        }
        else {
          this.health -= 1;
          object.yVelocity = -25;
          if (this.x > object.x) {
            object.xkb -= 15;
          }
          else {
            object.xkb += 15;
          }
        }
        if (this.health == 0) {
          object.complete = true;
        }
      }
    }
    enemy2.prototype.move = function(object) {
      var thisCoordinates = [this.x + (0.5 * this.width), this.y + (0.5 * this.height)];
      var playerCoordinates = [object.x + (0.5 * object.width), object.y + (0.5 * object.height)];
      var vector = [2];
      vector = [playerCoordinates[0] - thisCoordinates[0], playerCoordinates[1] - thisCoordinates[1]];
      var angle = Math.atan2(vector[1], vector[0]);
      if (this.chaseSet == false) {
        this.crossed = false;
        this.targetPos = [object.x - (0.25 * this.width), object.y - (0.25 * this.height)];
        if (object.y > this.y || this.y > 200) {
          this.xVelocity = 5 * Math.cos(angle);
          this.yVelocity = 5 * Math.sin(angle);
        }
        else {
          this.patience = 0;
        }
        this.patience -= 1;

        if (this.patience <= 0) {
          if (object.y > this.y || this.y > 150) {
            this.xVelocity = 7.5 * Math.cos(angle);
            this.yVelocity = 7.5 * Math.sin(angle);
          }
          else {
            angle += random(-0.5 * Math.PI, 0.5 * Math.PI);
            this.xVelocity = -7.5 * Math.cos(angle);
            this.yVelocity = -7.5 * Math.sin(angle);
          }
          this.chaseTime = random(50, 100);
          if (this.y > 60) {
            angle += random(-0.5 * Math.PI, 0.5 * Math.PI);
            this.xVelocity = -7.5 * Math.cos(angle);
            this.yVelocity = -7.5 * Math.sin(angle);
          }
          if (this.y < 500) {
            this.xVelocity = 7.5 * Math.cos(angle);
            this.yVelocity = 7.5 * Math.sin(angle);
          }
          this.chaseSet = true;
        }
      }
      else {
        this.chaseTime -= 1;
        if (this.x > 505 || this.x < 15) {
          this.xVelocity = -this.xVelocity;
          this.yVelocity = -this.yVelocity;
        }
        if (this.y > 459 || this.y < 75) {
          this.xVelocity = -this.xVelocity;
          this.yVelocity = -this.yVelocity;
        }
        if (this.chaseTime <= 0) {
          this.crossed = true;
          this.x = this.targetPos[0];
          this.y = this.targetPos[1];
          this.patience = random(150, 200);
          this.chaseSet = false;
        }
      }



      this.x += this.xVelocity;
      this.y += this.yVelocity;
    }

    var Enemy2s = [];

    var shot = function(config) {
      this.x = config.x;
      this.y = config.y;
      this.width = config.width || 15;
      this.height = config.height || 15;
      this.rotation = config.rotation || 0;
      this.speed = config.speed || 5;
      this.isActive = true;
    };
    shot.prototype.resetTimer = function(parent, newRotation, newSpeed) {
      this.x = parent.x + (0.5 * parent.width);
      this.y = parent.y + (0.5 * parent.height);
      this.rotation = newRotation;
      this.speed = newSpeed;
      this.isActive = true;
    };
    var bulletManager = function(bullets) {
      for (var i = 0; i < bullets.length; i++) {
        if (bullets[i].isActive == false) {
          return i;
        }
      }
      return -1;
    }
    shot.prototype.shotMove = function() {
      this.x += this.speed * Math.cos(this.rotation);
      this.y += this.speed * Math.sin(this.rotation);

      if (this.x < -50 || this.x > 650 || this.y < -50 || this.y > 650) {
        this.isActive = false;
      }
    }
    shot.prototype.collide = function(object) {
      if (rectCollide(this, object)) {
        object.dead = true;
      }
    }

    var iceBeam = function(config) {
      this.x = config.x;
      this.y = config.y;
      this.img = loadImage("https://www.freepngclipart.com/download/light/42007-blue-light-laser-beam-free-transparent-image-hq.png");
      this.width = config.width || 50;
      this.height = config.height || 50;
      this.rotation = config.rotation || 0;
      this.speed = config.speed || 5;
      this.isActive = true;
    };
    iceBeam.prototype.resetTimer = function(parent, newRotation, newSpeed) {
      this.x = parent.x + (0.5 * parent.width);
      this.y = parent.y + (0.5 * parent.height);
      this.rotation = newRotation;
      this.speed = newSpeed;
      this.isActive = true;
    };
    iceBeam.prototype.shotMove = function() {
      this.x += this.speed * Math.cos(this.rotation);
      this.y += this.speed * Math.sin(this.rotation);

      if (this.x < -100 || this.x > 700 || this.y < -100 || this.y > 700) {
        this.isActive = false;
      }
    }
    iceBeam.prototype.collide = function(object) {
      if (rectCollide(this, object)) {
        object.dead = true;
      }
    }

    var enemy3 = function(config) {
      this.x = config.x;
      this.y = config.y;
      this.img = loadImage("https://archives.bulbagarden.net/media/upload/thumb/6/61/0385Jirachi.png/250px-0385Jirachi.png");
      this.img2 = loadImage("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPAL-fYA3BBNPQN8e5VkclY0EYBeMvkkl_vvqTajGuT7A2LahS4yc3zrZNtPxwnRJA2rg:https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/e8ddc4da-23dd-4502-b65b-378c9cfe5efa/dffv4m1-0688a8ab-c5e9-4ba8-8df7-4785070aecc9.png/v1/fill/w_894,h_894,q_70,strp/burned_icon_pokemon_sword_and_shield_by_jormxdos_dffv4m1-pre.jpg%3Ftoken%3DeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI4MCIsInBhdGgiOiJcL2ZcL2U4ZGRjNGRhLTIzZGQtNDUwMi1iNjViLTM3OGM5Y2ZlNWVmYVwvZGZmdjRtMS0wNjg4YThhYi1jNWU5LTRiYTgtOGRmNy00Nzg1MDcwYWVjYzkucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.giiRlz7HkvdM7TdClIiBOOeuhYcryXFvKbVEFpd9qNc&usqp=CAU");
      this.width = config.width || 80;
      this.height = config.height || 80;
      this.health = config.health || 0;
      this.chaseTime = 0;
      this.bullets = [];
      this.icebeams = [];
      this.shotLength = 8;
      this.shotCd = 0;
      this.xVelocity = 0;
      this.yVelocity = 5;
    };
    enemy3.prototype.display = function() {
      this.y = constrain(this.y, 20, height - this.height);
      this.x = constrain(this.x, 10, width - (this.width));
      noStroke();
      fill(255, 0, 0);
      rect(this.x, this.y, this.width, this.height)
      for (var shotNum = 0; shotNum < this.bullets.length; shotNum++) {
        if (this.bullets[shotNum].isActive === true) {
          rect(this.bullets[shotNum].x - 2.5, this.bullets[shotNum].y + 2.5, this.bullets[shotNum].width + 5, this.bullets[shotNum].height + 5);

        }
        this.bullets[shotNum].shotMove();
      }

      for (var iceNum = 0; iceNum < this.icebeams.length; iceNum++) {

        if (this.icebeams[iceNum].isActive === true) {
          fill(0, 128, 255)
          rect(this.icebeams[iceNum].x, this.icebeams[iceNum].y, this.icebeams[iceNum].width, this.icebeams[iceNum].height);
        }
        this.icebeams[iceNum].shotMove();
      }
      fill(255, 0, 0);
      rect(50, 10, this.health * 12.5, 30);
      image(this.img2, 500, 10, 50, 50);
      image(this.img, this.x - 25, this.y - 25, this.width + 50, this.height + 50);
    };
    enemy3.prototype.collide = function(object) {
      if (rectCollide(this, object)) {
        if (object.y > this.y + 10) {
          object.dead = true;
        }
        else {
          this.health -= 1;
          object.yVelocity = -25;
          if (this.x > object.x) {
            object.xkb -= 15;
          }
          else {
            object.xkb += 15;
          }
        }
        if (this.health == 0) {
          object.complete = true;
        }
      }
    }
    enemy3.prototype.shoot = function(object) {
      var randomness = random(Math.PI, 0);
      for (var i = 0; i < this.shotLength; i++) {
        if (this.bullets.length != 0) {
          if (bulletManager(this.bullets) != -1) {

            this.bullets[bulletManager(this.bullets)].resetTimer(this, ((2 * Math.PI / this.shotLength) * (i + 1)) + randomness, 5);
          }
          else {
            this.bullets.push(new object({
              x: this.x + 0.5 * this.width,
              y: this.y + (0.5 * this.height),
              rotation: ((2 * Math.PI / this.shotLength) * i),
              speed: 5,
            }));
          }
        }
        else {
          for (var i = 0; i < this.shotLength; i++) {
            this.bullets.push(new object({
              x: this.x + 0.5 * this.width,
              y: this.y + (0.5 * this.height),
            }));
            this.bullets[i].resetTimer(this, (2 * Math.PI / this.shotLength) * i, 5);
          }
        }
      }
    };
    enemy3.prototype.shoot2 = function(object, angle) {
      this.icebeams.push(new object({
        x: this.x + 0.5 * this.width,
        y: this.y + (0.5 * this.height),
        rotation: angle,
        speed: 8.5,
      }));
    };
    enemy3.prototype.ai = function(object) {
      var thisCoordinates = [this.x + (0.5 * this.width), this.y + (0.5 * this.height)];
      var playerCoordinates = [object.x + (0.5 * object.width), object.y + (0.5 * object.height)];
      var vector = [2];
      vector = [playerCoordinates[0] - thisCoordinates[0], playerCoordinates[1] - thisCoordinates[1]];
      var randomness = random(-0.5 * Math.PI, 0.5 * Math.PI);
      var angle = Math.atan2(vector[1], vector[0]);
      if (this.chaseTime <= 0) {
        this.shoot2(iceBeam, angle + (1 / 64 * Math.PI));
        this.health -= 1;
        this.chaseTime = random(50, 100);
        this.xVelocity = 4 * -Math.cos(angle + randomness);
        this.yVelocity = 4 * -Math.sin(angle + randomness);
      }
      else {
        this.chaseTime -= 1;
        if (this.y < 50 || this.y > 450) {
          this.yVelocity *= -1;
        }
        if (this.x < 35 || this.x > 500) {
          this.xVelocity *= -1;
        }
      }



      this.x += this.xVelocity;
      this.y += this.yVelocity;

      if (this.shotCd <= 0) {
        this.shoot(shot);
        this.shotLength = random(5, 8);
        this.shotCd = 20;
      }
      this.shotCd -= 1;
    };

    var Enemy3s = [];

    var LevelMap = [
      {
        Level: 1,
        map: [
          "                                        ",
          "                                        ",
          "                         ####           ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "      #       #                         ",
          "      #       #                         ",
          "      #       #                         ",
          "      #       #                         ",
          "      #       #                         ",
          "      #       #                         ",
          "       #     #                          ",
          "       ##   ##                          ",
          "         ###                            ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                     #####              ",
          "                     #    #             ",
          "                     #    #             ",
          "                     #    #             ",
          "                     #    #             ",
          "                     #####              ",
          "                     #                  ",
          "                     #                  ",
          "     @               #                  ",
          "                     #                  ",
          "                                        ",
          "                                        ",
          "##########                              ",
          "##########                              ",
          " #####  ##                              ",
          "  ###   ##                              ",
          "   ##    #                              ",
          "    #    #                              ",


        ],
      },
      {
        Level: 2,
        map: [
          "                                        ",
          "                                        ",
          "                  ####                  ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                               ###      ",
          "                                        ",
          "                                        ",
          "          #                             ",
          "          #                             ",
          "          #                             ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                           #            ",
          "                           #            ",
          "                           #            ",
          "                           #            ",
          "                           #            ",
          "                           #            ",
          "                           #            ",
          "                           #            ",
          "                           #            ",
          "                           #            ",
          "                           #            ",
          "                           #            ",
          "                           #            ",
          "                           #            ",
          "     @                     #            ",
          "                           #            ",
          "                                        ",
          "                                        ",
          "   #######                              ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 3,
        map: [
          "                                        ",
          "                                        ",
          "                  ####                  ",
          "                                        ",
          "                                        ",
          "     #                                  ",
          "     #                                  ",
          "     #                                  ",
          "                                        ",
          "                                        ",
          "                 #                      ",
          "                 #                      ",
          "                 #                      ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                           #            ",
          "                           #            ",
          "                           #            ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                 #                      ",
          "                 #                      ",
          "                 #                      ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                           #            ",
          "     @                     #            ",
          "                           #            ",
          "                                        ",
          "                                        ",
          "   #######                              ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 4,
        map: [
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                       #                ",
          "                       #                ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "         #                              ",
          "         #                              ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                  %%%%%%%%%%%%%%%%%%%%%%",
          "                  ######################",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                         #              ",
          "                         #               ",
          "     @                                  ",
          "                                        ",
          "                                        ",
          "                                        ",
          "   #######                              ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 5,
        map: [
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "             ###                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "#                                       ",
          "#                                       ",
          "#                                       ",
          "                                        ",
          "                                        ",
          "          %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
          "          ##############################",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                  %                     ",
          "                  %                     ",
          "                  %#                    ",
          "                  %#                    ",
          "                  %#                    ",
          "                  %                     ",
          "                  %                     ",
          "                  %                     ",
          "     @                                  ",
          "                             #          ",
          "                             #          ",
          "                             #          ",
          "   #######                              ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 6,
        map: [
          "                                       #",
          "                                       #",
          "                                       #",
          "                                        ",
          "        #             %                 ",
          "        #             %                 ",
          "        #             %                 ",
          "                      %                 ",
          "                      #                 ",
          "                      #                 ",
          "                      #                 ",
          "                      #                 ",
          "                      %                 ",
          "                      %                 ",
          "                      %                 ",
          "                      %                 ",
          "                      %                 ",
          "                                        ",
          "                                        ",
          "                #                       ",
          "                #                       ",
          "                                        ",
          "                      %                 ",
          "                      %                 ",
          "                      %                 ",
          "                      %      #          ",
          "                      %      #          ",
          "                                        ",
          "                                        ",
          "                                        ",
          "     @                                  ",
          "                    ###                 ",
          "                                        ",
          "                                        ",
          "   #######                              ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 7,
        map: [
          "#                                       ",
          "#         %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
          "          ##############################",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                              %#        ",
          "                              %#        ",
          "                              %#        ",
          "      %#                                ",
          "      %#                                ",
          "      %#                                ",
          "      %#                                ",
          "      %#              ###               ",
          "      %#                                ",
          "      %#                                ",
          "                                        ",
          "                                        ",
          " #%                                     ",
          " #%                                     ",
          " #%                                     ",
          " #%                                     ",
          " #%                                     ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "     @                                  ",
          "                                        ",
          "                                        ",
          "                                        ",
          "   #######                              ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 8,
        map: [
          "                                        ",
          "                                        ",
          "                                        ",
          "               #%                       ",
          "               #%                       ",
          "               #%                       ",
          "               #%                       ",
          "               #%                       ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                     #####              ",
          "                                        ",
          "                                        ",
          "                                        ",
          "              %#                        ",
          "              %#                        ",
          "              %#                         ",
          "              %#                         ",
          "              %#                         ",
          "              %#                        ",
          "                                        ",
          "                                        ",
          "       #                                ",
          "       #                                ",
          "       #                                ",
          "                                        ",
          "#                                       ",
          "#                                       ",
          "#                                @      ",
          "#                                       ",
          "#     %%%%%%%%%%%%%%%%%%%%%%%%%%        ",
          "      ##############################    ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 9,
        map: [
          "#                                       ",
          "#                                       ",
          "#                                       ",
          "#                                       ",
          "#                                       ",
          "#                                       ",
          "#                                       ",
          "#                                       ",
          "                                        ",
          "                                        ",
          "         %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
          "         ###############################",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                      # ",
          "                                      # ",
          "                                      # ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "            ###                ###      ",
          "#                                       ",
          "#                                       ",
          "#                                       ",
          "       %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
          "       #################################",
          "                                 @      ",
          "                                        ",
          "                                        ",
          "                             #######    ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 10,
        map: [
          "                   *                    ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "           ####                          ",
          "                             #          ",
          "                             #          ",
          "                             #          ",
          "                             #          ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "  #######                      #######  ",
          "                                        ",
          "                    @                   ",
          "                                        ",
          "                                        ",
          "                ########                ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 11,
        map: [
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   %                    ",
          "                   %%#######            ",
          "                   %                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   %                    ",
          "    ##############%%%###############    ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                    @                   ",
          "                                        ",
          "                                        ",
          "                ########                ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 12,
        map: [
          "%                                       ",
          "%                                       ",
          "%                                       ",
          "%                         #             ",
          "%                         #             ",
          "%                        %#             ",
          "%                        %#             ",
          "%                        %              ",
          "%   @                    %              ",
          "%                        %             #",
          " ######                  %             #",
          "                         %             #",
          "                         %             #",
          "%%%%%%%%%%%%%%   %%%%%%%%#              ",
          "                        %#              ",
          "                        %#              ",
          "                        %#              ",
          "                        %#              ",
          "                        %#              ",
          "                        %#              ",
          "                        %#              ",
          "                        %#              ",
          "%%%%%%%%%%   %%%%%%%%%%%%#              ",
          "                        %#              ",
          "                        %#              ",
          "                        %#              ",
          "                        %#              ",
          "                        %#              ",
          "                        %#              ",
          "                        %#              ",
          "%%%%%%%%%%%%   %%%%%%%%%%#              ",
          "                        %#              ",
          "                        %#              ",
          "                               #########",
          "                                        ",
          "                                   %    ",
          "                                  #%    ",
          "                                  #%    ",
          "       ###########                #%    ",
          "                                   %    ",


        ],
      },
      {
        Level: 13,
        map: [
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                      #%                ",
          "                      #%                ",
          "                      #%                ",
          "                      #%                ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                    %%%   %%            ",
          "                   %%%%%%               ",
          "                   %%%%%     %%#        ",
          "                   %%%%%  %%%           ",
          "                    %%%                 ",
          "            %%%                       #%",
          "           %%%%%                      #%",
          "           %%%%%                      #%",
          "#          %%%%%                      #%",
          "#           %%%    ######               ",
          "#             %                         ",
          "#          %                            ",
          "#          %                            ",
          "#            %                          ",
          "#        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
          "         ##############################%",
          "                                        ",
          "                                        ",
          "                                        ",
          "                             @          ",
          "                                        ",
          "                         ########       ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 14,
        map: [
          "                                        ",
          "                                        ",
          "           %#                           ",
          "           %#                           ",
          "           %#                           ",
          "           %#                           ",
          "                                        ",
          "                      %%%%%%%%%%%%%%%%%%",
          "                      ##################",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "      %#                                ",
          "      %#                              # ",
          "      %#                              # ",
          "%%%   %#                              # ",
          "#     %#                              # ",
          "#                                       ",
          "#                                       ",
          "#                                       ",
          "#                                       ",
          "#      %%%%%%%%%%%%%%%%%%%       %%%%%%%",
          "       #########%%%%##################%%",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                               %%%%%%#  ",
          "                                        ",
          "                           %%%%%%%      ",
          "                    @                   ",
          "                                        ",
          "                                        ",
          "                ########                ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 15,
        map: [
          "         %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
          "         ########%%%####################",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                      # ",
          "                                      # ",
          "                                      # ",
          "                                      # ",
          "            %                         # ",
          "            %                           ",
          "            %                           ",
          "            %                           ",
          "            %                           ",
          "            %            %#             ",
          "            %            %#             ",
          "            %            %#             ",
          "                         %#             ",
          "                         %#             ",
          "                                        ",
          "                                        ",
          "            %   #####                   ",
          "%#          %                           ",
          "%#          %                           ",
          "%#          %                           ",
          "%#          %                           ",
          "%#          %                           ",
          "%#          %                           ",
          "            %                           ",
          "            %                           ",
          "            %       @                   ",
          "                                        ",
          "                                        ",
          "                ########                ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 16,
        map: [
          "      %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
          "      %%%###############################",
          "      #                                 ",
          "      #                                 ",
          "      #              %                  ",
          "      #              %           #      ",
          "      %              %           #      ",
          "#     %              %           #%     ",
          "#     %              %           #%     ",
          "#     %              %%%%         %     ",
          "#     %%%%    %%%%%%%%  ##        %     ",
          "#     %              %  ##              ",
          "#     %              %  ##              ",
          "#    #%              %  ##              ",
          "#    #%              %%%%               ",
          "#    #%              %                  ",
          "#    #%              %            %     ",
          "#     %%%    %%%%%%%%%            %     ",
          "#     %              %            %#    ",
          "#     %              %            %#    ",
          "#     %              %            %#    ",
          "#     %              %            %#    ",
          "#     %              %                  ",
          "#     %              %                  ",
          "#    #%              %                  ",
          "#    #%%%%%%%%    %%%%  #               ",
          "#    #%              %  #               ",
          "#    #%           #  %  #               ",
          "#     %           #  %  #               ",
          "#     %           #  %                  ",
          "#                 #  %                  ",
          "#                    %                  ",
          "#                    %          @       ",
          "                     %                  ",
          "                     %       #########  ",
          "        ###          %                  ",
          "                     %                  ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 17,
        map: [
          "                                    #%  ",
          "                                    #%  ",
          "                                    #%  ",
          "                                    #%  ",
          "                                    #%  ",
          "                                    #%  ",
          "                                        ",
          "                                        ",
          "                                        ",
          "           %                            ",
          "           %                            ",
          "           %            %#              ",
          "           %            %#              ",
          "           %            %#              ",
          "           %            %#              ",
          "           %                            ",
          "           %                            ",
          "                                        ",
          "                 #%                     ",
          "                 #%        #%           ",
          "                 #%        #%           ",
          " %#              #%        #%           ",
          " %#                        #%           ",
          " %#        %                            ",
          " %#        %                            ",
          " %#        %                            ",
          "          #%                            ",
          "          #%                            ",
          "          #%                            ",
          "          #%                            ",
          "           %                            ",
          "           %        @                   ",
          "           %                            ",
          "           %                            ",
          " #######   %    ########                ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 18,
        map: [
          "#                                       ",
          "#                                       ",
          "#                                       ",
          "#          %%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
          "#          #############%%%#############",
          "#                                       ",
          "                                        ",
          "                                        ",
          "               %                        ",
          "               %                        ",
          "               %                        ",
          "               %                  %#    ",
          "               %                  %#    ",
          "               %                  %#    ",
          "                                  %#    ",
          "                                  %#    ",
          "                                  %#   ",
          "                                  %#    ",
          "               %                        ",
          "               %    #######             ",
          "               %    %%%%%%%             ",
          "        #%     %                        ",
          "        #%     %                        ",
          "        #%     %                        ",
          "        #%                              ",
          "        #%                              ",
          "                                        ",
          " #                                      ",
          " #                        @             ",
          " #                                      ",
          " #                      #######         ",
          " #     %%%%%%%%%%       %%%%%%%         ",
          "       ##########                       ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 19,
        map: [
          "                                        ",
          "                                        ",
          "                                        ",
          "        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
          "        ###########%%%##################",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                          #%            ",
          "                          #%            ",
          "                          #%            ",
          "                          #%            ",
          "                          #%            ",
          "          ######                        ",
          "#                                       ",
          "#                                       ",
          "#                                       ",
          "#     %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
          "#     #######%%%########################",
          "#                                       ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                  #%    ",
          "                                  #%    ",
          "                                  #%    ",
          "                                  #%    ",
          "                                  #%    ",
          "                                  #%    ",
          "                    @             #%    ",
          "                                  #%    ",
          "                                  #%    ",
          "                ########                ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 20,
        map: [
          "                      &                 ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                   #    ",
          "                                   #    ",
          "                                   #    ",
          "                                   #    ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                       ########         ",
          "                                        ",
          "         #                              ",
          "         #                            #%",
          "         #                            #%",
          "         #                            #%",
          "         #                            #%",
          "         #                            #%",
          "         #                              ",
          "         #                              ",
          "         #                              ",
          "                                        ",
          "                                        ",
          "                    @                   ",
          "                              ########  ",
          "                                        ",
          "                ########                ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 21,
        map: [
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                   #                    ",
          "                  %%#                   ",
          "                 %%%%#                  ",
          "                %% # %#                 ",
          "               %%  #  %#                ",
          "              %%   #   %#               ",
          "             %%    #    %#              ",
          "            %%     #     %#             ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #      #######       ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                   #                    ",
          "                ########                ",
          "                %%%%%%%%                ",
          "                                        ",
          "                    @                   ",
          "                              ########  ",
          "                                        ",
          "                ########                ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 22,
        map: [
          "                     #                  ",
          "                     #                  ",
          "                     #                  ",
          "                     #                  ",
          "                              #%        ",
          "                              #%        ",
          "                              #%        ",
          "                              #%        ",
          "                              #%        ",
          "                   %                    ",
          "                   %                    ",
          "                   %                    ",
          "                   %                    ",
          "                   %               %#   ",
          "                   %               %#   ",
          "                   %               %#   ",
          "                                   %#   ",
          "                                   %#   ",
          "                                        ",
          "                   %                    ",
          "                   %    ######          ",
          "                   %    %%%%%%          ",
          "                   %                    ",
          "             #%    %                    ",
          "             #%    %                    ",
          "             #%    %                    ",
          "             #%                         ",
          "             #%                         ",
          "              %                         ",
          "              %                         ",
          "              %                         ",
          "              %     @                   ",
          "              %                         ",
          "  ###%%%%%%%%%%                         ",
          "                ########                ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 23,
        map: [
          "                     #                  ",
          "                     #                  ",
          "                     #                  ",
          "                     #                  ",
          "                     #                  ",
          "                                        ",
          "                                        ",
          "      ######                            ",
          "      %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
          "      ##################################",
          "                                        ",
          "                                        ",
          "                                        ",
          "                               #%       ",
          "                               #%       ",
          "                               #%       ",
          "                               #%       ",
          "                               #%       ",
          "                                    #%  ",
          "                    %%%%%%%%        #%  ",
          "                    ########        #% ",
          "                                    #%  ",
          "          %#                        #%  ",
          "          %#                            ",
          "          %#                            ",
          "          %#                            ",
          "                                        ",
          "        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
          "        ########%%######################",
          "                                        ",
          "                                        ",
          "                                   @    ",
          "                                        ",
          "                               #######  ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 24,
        map: [
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                  ######                ",
          "                  %%%%%%                ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                  ######                ",
          "                  %%%%%%                ",
          "                            %           ",
          "                            %           ",
          "                            %           ",
          "                            %         #%",
          "                            %         #%",
          "                            %         #%",
          "                            %         #%",
          "                            %         #%",
          "                            %           ",
          "                                 #      ",
          "                                 #      ",
          "                                 #      ",
          "                                 #      ",
          "                            %           ",
          "                            %           ",
          "                ########    %           ",
          "                %%%%%%%%    %           ",
          "                            %           ",
          "                    @       %           ",
          "                                        ",
          "                                        ",
          "                ########                ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 25,
        map: [
          "                                        ",
          "                                        ",
          "                                        ",
          "           #                            ",
          "          ###                           ",
          "         #####                          ",
          "           #                            ",
          "           #                            ",
          "           #                            ",
          "           #                            ",
          "           #                            ",
          "           #                            ",
          "           #                            ",
          "                                        ",
          "                                        ",
          "       %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
          "       #################################",
          "                                        ",
          "                                        ",
          "                                        ",
          "                          %#            ",
          "                          %#            ",
          "                          %#            ",
          "                          %#            ",
          "                          %#            ",
          "                                        ",
          "                                 #%     ",
          "                                 #%     ",
          "                                 #%     ",
          "                                 #%     ",
          "                    @            #%     ",
          "                                 #%     ",
          "                                        ",
          "                ########                ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 26,
        map: [
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                 #####                  ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                               ######   ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                #######                 ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "   #######                             ",
          "                                        ",
          "                                        ",
          "                    @                   ",
          "                                        ",
          "                                        ",
          "                ########                ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 27,
        map: [
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                     ####               ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                   ###  ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                       #####            ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "              ###                       ",
          "                                        ",
          "                                        ",
          "                                        ",
          "   @                                    ",
          "                                        ",
          " #######                                ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 28,
        map: [
          "       #                %%%%%%%%%%%%%%%%",
          "       #                %               ",
          "       #                %          @    ",
          "       #                %         ###   ",
          "       %%%%%%%%%%%%%%%%%%               ",
          "       #################%%%%%%%    %%%%%",
          "                        %               ",
          "                        %               ",
          "                        %               ",
          "                        %               ",
          "             #          %               ",
          "             #          %               ",
          "            %#          %               ",
          "            %#          %               ",
          "            %           %               ",
          "            %           %               ",
          "            %           %%%%%%%%%%    %%",
          "            %          #%               ",
          "            %          #%               ",
          "                       #%               ",
          "                       #%               ",
          "                        %               ",
          "                        %               ",
          "            %           %               ",
          "            %           %               ",
          "    %#      %           %               ",
          "    %#      %           %               ",
          "    %#      %           %%%%%%%     %%%%",
          "    %#                  %               ",
          "    %#                  %               ",
          "                        %               ",
          "                        %               ",
          "                  #%    %               ",
          "                  #%    %               ",
          "                  #%                    ",
          "                  #%        #######     ",
          "                  #%                    ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 29,
        map: [
          "                                        ",
          "                                        ",
          "                     #                  ",
          "                     #                  ",
          "                     #                  ",
          "                     #                  ",
          "                     #                  ",
          "                     #                  ",
          "                     #                  ",
          "                     #                  ",
          "                     #                  ",
          "                     #                  ",
          "                     #                  ",
          "                     #                  ",
          "                     #                  ",
          "                     #                  ",
          "                     #                  ",
          "        #                               ",
          "        #                               ",
          "        #                               ",
          "        #                               ",
          "        #                               ",
          "        #                               ",
          "        #                               ",
          "        #                               ",
          "        #                               ",
          "        #                               ",
          "        #                               ",
          "        #                               ",
          "        #                               ",
          "        #                               ",
          "        #           @                   ",
          "                                        ",
          "                                        ",
          "                ########                ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 30,
        map: [
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "       #######################          ",
          "                                        ",
          "                                        ",
          "                 ^                      ",
          "                                        ",
          "                                      # ",
          "                                      # ",
          "                                      # ",
          "                                      # ",
          "                                        ",
          "                                        ",
          "                                        ",
          "             #                          ",
          "             #                          ",
          "             #                          ",
          "                                        ",
          "                                        ",
          "                              #         ",
          "                              #         ",
          "                              #         ",
          "                                        ",
          "                                        ",
          "      #                                 ",
          "      #                                 ",
          "      #             @                   ",
          "                                 #####  ",
          "                                        ",
          "                ########                ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",


        ],
      },
      {
        Level: 31,
        map: [
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "                                        ",
          "  ####   ####                           ",
          " #      #                               ",
          " #      #                               ",
          " #   ## #   ##                          ",
          " #    # #    #                          ",
          "  ####   ####                           ",
          "                                        ",
          "                                        ",
          "                    #                   ",
          "                    #                   ",
          "                    #                   ",
          "                    #                   ",
          "                    #                   ",
          "                    #                   ",
          "                    #                   ",
          "                    #                   ",
          "                    #                   ",
          "                    #                   ",
          "                   %#%                  ",
          "                   %#%                  ",
          "                   %#%                  ",
          "                   %#%                  ",
          "     @             %#%                  ",
          "                  %###%                 ",
          "                  %###%                 ",
          "                  %###%                 ",
          "   #######        %###%                 ",
          "                 %#####%                ",
          "                 %#####%                ",
          "                 %#####%                ",
          "                %#######%               ",
          "                %#######%               ",


        ],
      },

    ];

    var LevelRestart = function() {
      l = (Level - 1);
      Players[l] = [];
      Blocks[l] = [];
      lavaBlocks[l] = [];
      Enemy1s[l] = [];
      Enemy2s[l] = [];
      Enemy3s[l] = [];
      for (var columnNum = 0; columnNum < LevelMap[l].map.length; columnNum++) {
        for (var rowNum = 0; rowNum < LevelMap[l].map[columnNum].length; rowNum++) {
          var Y = columnNum * 15;
          var X = rowNum * 15;

          switch (LevelMap[l].map[columnNum][rowNum]) {
            case "@":
              Players[l].push(new player({
                x: X,
                y: Y,
                dead: false,
                complete: false,
              }));
              break;
            case "#":
              Blocks[l].push(new block({
                x: X,
                y: Y,
              }));
              break;
            case "%":
              lavaBlocks[l].push(new lavaBlock({
                x: X,
                y: Y,
              }));
              break;
            case "*":
              Enemy1s[l].push(new enemy1({
                x: X,
                y: Y,
                health: 30,
                patience: 200,
              }));
              break;
            case "&":
              Enemy2s[l].push(new enemy2({
                x: X,
                y: Y,
                health: 30,
                patience: 200,
                crossed: false,
              }));
              break;
            case "^":
              Enemy3s[l].push(new enemy3({
                x: X,
                y: Y,
                health: 35,
              }));
              break;
          }
        }
      }
    };

    LevelRestart();
    draw = function() {
      background(0, 0, 0);
      for (var blockNum = 0; blockNum < Blocks[l].length; blockNum++) {
        Blocks[l][blockNum].display();
      }
      for (var lavaBlockNum = 0; lavaBlockNum < lavaBlocks[l].length; lavaBlockNum++) {
        lavaBlocks[l][lavaBlockNum].display();
      }
      for (var enemy1Num = 0; enemy1Num < Enemy1s[l].length; enemy1Num++) {
        Enemy1s[l][enemy1Num].display();
      }
      for (var enemy2Num = 0; enemy2Num < Enemy2s[l].length; enemy2Num++) {
        Enemy2s[l][enemy2Num].display();
      }
      for (var enemy3Num = 0; enemy3Num < Enemy3s[l].length; enemy3Num++) {
        Enemy3s[l][enemy3Num].display();

      }

      for (var playerNum = 0; playerNum < Players[l].length; playerNum++) {
        Players[l][playerNum].display();
        if (Players[l][playerNum].complete) {
          Level += 1;
          LevelRestart();
        }
        if (Players[l][playerNum].dead) {
          if (Level > 1 + 10 * Players[l][playerNum].checkpoint)
            Level -= 0;
          LevelRestart();
        }
      }
      for (var playerNum = 0; playerNum < Players[l].length; playerNum++) {
        Players[l][playerNum].moveX();
        Players[l][playerNum].moveY();
      }

      for (var blockNum = 0; blockNum < Blocks[l].length; blockNum++) {
        for (var playerNum = 0; playerNum < Players[l].length; playerNum++) {
          Blocks[l][blockNum].collideX(Players[l][playerNum]);
        }
        for (var playerNum = 0; playerNum < Players[l].length; playerNum++) {
          Blocks[l][blockNum].collideY(Players[l][playerNum]);
        }
      }

      for (var lavaBlockNum = 0; lavaBlockNum < lavaBlocks[l].length; lavaBlockNum++) {
        for (var playerNum = 0; playerNum < Players[l].length; playerNum++) {
          lavaBlocks[l][lavaBlockNum].collide(Players[l][playerNum]);
        }
      }

      for (var enemy1Num = 0; enemy1Num < Enemy1s[l].length; enemy1Num++) {
        for (var playerNum = 0; playerNum < Players[l].length; playerNum++) {
          Enemy1s[l][enemy1Num].move(Players[l][playerNum]);
          Enemy1s[l][enemy1Num].collide(Players[l][playerNum]);
        }
      }
      for (var enemy2Num = 0; enemy2Num < Enemy2s[l].length; enemy2Num++) {
        for (var playerNum = 0; playerNum < Players[l].length; playerNum++) {
          Enemy2s[l][enemy2Num].move(Players[l][playerNum]);
          Enemy2s[l][enemy2Num].collide(Players[l][playerNum]);
        }
      }

      for (var enemy3Num = 0; enemy3Num < Enemy3s[l].length; enemy3Num++) {
        for (var playerNum = 0; playerNum < Players[l].length; playerNum++) {
          Enemy3s[l][enemy3Num].ai(Players[l][playerNum]);
          Enemy3s[l][enemy3Num].collide(Players[l][playerNum]);

        }
      }
      for (var enemy3Num = 0; enemy3Num < Enemy3s[l].length; enemy3Num++) {
        for (var shotNum = 0; shotNum < Enemy3s[l][enemy3Num].bullets.length; shotNum++) {
          for (var playerNum = 0; playerNum < Players[l].length; playerNum++) {
            Enemy3s[l][enemy3Num].bullets[shotNum].collide(Players[l][playerNum]);
          }
        }
      }

      for (var enemy3Num = 0; enemy3Num < Enemy3s[l].length; enemy3Num++) {
        for (var iceNum = 0; iceNum < Enemy3s[l][enemy3Num].icebeams.length; iceNum++) {
          for (var playerNum = 0; playerNum < Players[l].length; playerNum++) {
            Enemy3s[l][enemy3Num].icebeams[iceNum].collide(Players[l][playerNum]);
          }
        }
      }




    }
    //----------------------------------------------
  }
};
const Canvas = document.createElement("canvas");
document.body.appendChild(Canvas);
const canv = Canvas.getContext("2d");
var processingInstance = new Processing(Canvas, programCode);
