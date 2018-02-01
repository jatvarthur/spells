;(function() {

    var stateLoad = {
        _MT: {}

        , preload: function () {
            var empty = game.add.image(0, 0, "loadingEmpty");
            var full = game.add.image(0, 0, "loadingFull");

            empty.anchor.set(0.5, 0.5);
            empty.y = game.world.centerY;
            empty.x = game.world.centerX;

            full.anchor.set(0, 0.5);
            full.x = game.world.centerX - empty.width / 2;
            full.y = empty.y;

            game.load.setPreloadSprite(full);

            this._doPreload();
        }

        , _doPreload: function() {
            game.load.image("field_background", "images/field/back.jpg");
            game.load.image("field_square", "images/field/square.png");

            game.load.image("unit_pikeman", "images/field/unit_3_1x1.png");
            game.load.image("unit_mage", "images/field/unit_2_1x1.png");

            /*
            game.load.image("game_logo", "images/ui/logo_game.png");

            game.load.image("city_signs", "images/main/Map_Back_signs.png");
            game.load.image("city_signs_green", "images/main/Map_Back_green.png");
            game.load.image("city_signs_red", "images/main/Map_Back_red.png");

            game.load.image("overlay", "images/ui/w_shadow.png");
            game.load.image("modal", "images/ui/w_frame.png");
            game.load.image("button", "images/ui/w_b.png");
            game.load.image("button_play", "images/ui/b_play.png");
            game.load.image("button_close", "images/ui/w_b_close.png");
            game.load.image("w_building_ill", "images/ui/w_ill_2.png");
            game.load.image("modal_guys_left", "images/ui/w_ill_your_guys.png");
            game.load.image("modal_guys_right", "images/ui/w_ill_enemy_guys.png");
            game.load.image("modal_your_place", "images/ui/w_ill_your_place.png");

            game.load.image("game_loss", "images/ui/ill_end_game.png");
            game.load.image("game_loss_photo", "images/ui/ill_end_game_photo.png");

            game.load.spritesheet("ic_building_type", "images/main/ic_building_sheet_150x150.png", 300, 300);
            game.load.spritesheet("ic_building", "images/main/houses.png", 125, 250);

            game.load.image("popup", "images/ui/w_pop_up_frame.png");
            game.load.image("w_popup_pos", "images/ui/ill_pop_up_good.png");
            game.load.image("w_popup_neg", "images/ui/ill_pop_up_bad.png");
            game.load.image("w_popup_cop", "images/ui/ill_pop_up_cop.png");

            game.load.audio('click', 'audio/paper1.wav');
            game.load.audio('backgroundMusic', 'audio/austin_blues.mp3');
            */
        }

        , create: function () {
            game.state.start("main");
        }

        , update: function () {

        }

    };

    // exports
    window.registerState("load", stateLoad);

})();
