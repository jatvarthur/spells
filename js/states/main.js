;(function() {

    // imports
    var Ability = Domain.Scripts.Ability;
    var Action = Domain.Scripts.Action;

    // game sate machine
    var State = {
        UNIT_SELECT: 1,
        UNIT_ACT: 2,
        UNIT_ABILITY: 3,
        ROUND_END: 4,
        BATTLE_OVER: 15
    };

    var stateMain = {
        _MT: {}

        // current state
        , _state: State.UNIT_SELECT
        // active unit that currently acts
        , _activeUnit: -1
        // active action to be selected
        , _activeAction: { action: Action.NONE }
        // tile with mouse over
        , _activeTile: null

        , preload: function() {

        }

        , create: function() {
            UI.unitInfo.show();
            UI.unitInfo.setClickCallback(this._abClick.bind(this));

            this.background = game.add.sprite(0, 0, "field_background");

            this.board = this._createBoard();
            this._placeSquares();

            this.units = [];
            this._createUnit(Domain.Data.Units.Mage, 1, 2, 4, {
                abilities: [
                    Domain.Data.Abilities.Fireball,
                    Domain.Data.Abilities.LightningArrow
                ]
            });
            this._createUnit(Domain.Data.Units.Pikeman, 1, 1, 1);
            this._createUnit(Domain.Data.Units.Pikeman, 1, 1, 8);

            this._createUnit(Domain.Data.Units.Mage, 2, 10, 4, {
                abilities: [
                    Domain.Data.Abilities.Windfury,
                    Domain.Data.Abilities.Frenzy,
                    Domain.Data.Abilities.Pacifism
                ]
            });
            this._createUnit(Domain.Data.Units.Pikeman, 2, 12, 1);
            this._createUnit(Domain.Data.Units.Pikeman, 2, 12, 8);

            this._buildInitiativeList();
        }

        , _createBoard: function() {
            var board = [];
            board.W = 14;
            board.H = 10;

            board._tile = {
                w: 78, h: 67, m: 4
            };

            var bfW = board.W, bfH = board.H;
            var t = board._tile;

            var totalw = bfW * t.w + (bfW - 1) * t.m;
            board._tile.ox = (game.world.width - totalw) / 2;
            board._tile.oy = (game.world.height - board._tile.ox);


            board.place = function(i, j, obj) {
                var t = this._tile;

                obj.x = t.ox + t.w/2 + i * (t.w + t.m);
                obj.y = t.oy - j * (t.h + t.m);

                if (obj._go.i >= 0) {
                    this[obj._go.j * this.W + obj._go.i]._unit = null;
                }

                obj._go.i = i;
                obj._go.j = j;

                this[j * this.W + i]._unit = obj;
            };

            board.remove = function(obj) {
                if (obj._go.i >= 0) {
                    this[obj._go.j * this.W + obj._go.i]._unit = null;
                }
                obj.destroy();
            };

            return board;
        }

        , _placeSquares: function () {
            var bfW = this.board.W, bfH = this.board.H;
            var t = this.board._tile;
            for (var j = 0; j < bfH; ++j) {
                for (var i = 0; i < bfW; ++i) {
                    var sq = game.add.sprite(
                        t.ox + i * (t.w + t.m),
                        t.oy - j * (t.h + t.m),
                        "field_square");
                    sq.anchor.set(0.0, 1.0);
                    sq.inputEnabled = true;
                    sq.events.onInputOver.add(this._sqMouseOver, this);
                    sq.events.onInputOut.add(this._sqMouseOut, this);
                    sq.events.onInputDown.add(this._sqMouseDown, this);
                    sq._go = { i: i, j: j };
                    this.board[j * bfW + i] = sq;
                }
            }
        }

        , _createUnit: function(proto, owner, i, j, opts) {
            var unit = game.add.sprite(0, 0, proto.type);
            unit.anchor.set(0.5, 1.0);
            unit.scale.x = owner === 1 ? 1 : -1;
            unit._go = new Domain.Unit(_.extend({}, proto, opts));
            unit._go.owner = owner;
            this.board.place(i, j, unit);
            this.units.push(unit);
            return unit;
        }

        , _removeUnit: function(unit) {
            this.board.remove(unit);
        }

        , _buildInitiativeList: function() {
            this.units.sort(function(a, b) {
                return b._go.initiative - a._go.initiative;
            });
        }

        , _setAction: function (action, move, target) {
            this._activeAction.unit = this.units[this._activeUnit];
            this._activeAction.action = action || Action.NONE;
            this._activeAction.moveTile = move || null;
            this._activeAction.targetTile = target || null;
        }

        , _checkMove: function(unit, tile) {
            if (tile._wvs > 0) {
                this._setAction(Action.MOVE, tile);
                return true;
            }

            return false;
        }

        , _checkAttack: function(unit, tile) {
            if (!tile._unit || tile._unit._go.owner === unit._go.owner)
                return false;

            // check for ranged
            if (unit._go.rangedAttack) {
                this._setAction(Action.RANGED_ATTACK, null, tile);
                return true;
            }

            // check for melee
            if (unit._go.meleeAttack) {
                var moveTile = this._getNearestWalkableTo(tile);
                if (moveTile) {
                    this._setAction(Action.MELEE_ATTACK, moveTile, tile);
                    return true;
                }
            }

            return false;
        }

        , _checkAbility: function(unit, tile, ability) {
            var result = false;
            // todo Domain.AbilityTarget.NONE
            if (ability._targetable === Domain.AbilityTarget.TILE) {
                result = true;
            }

            if (ability._targetable === Domain.AbilityTarget.ALLY) {
                result = tile._unit && tile._unit._go.owner === unit._go.owner;
            }

            if (ability._targetable === Domain.AbilityTarget.ENEMY) {
                result = tile._unit && tile._unit._go.owner !== unit._go.owner;
            }

            if (ability._targetable === Domain.AbilityTarget.BOTH) {
                result = !!tile._unit;
            }

            if (result) {
                this._setAction(Action.ABILITY, null, tile);
            }

            return result;
        }

        , _executeAction: function() {
            if (this._activeAction.action && this._activeAction.action !== Action.NONE) {
                this._activeAction.action.execute.call(this, this._activeAction);
                return true;
            }

            return false;
        }

        , _getNearestWalkableTo: function(tile) {
            var bfW = this.board.W, bfH = this.board.H;
            var min = bfW * bfH;
            var result = null;

            for (var dj = -1; dj <= 1; ++dj) {
                var j = tile._go.j + dj;
                if (j < 0 || j >= bfH) continue;
                for (var di = -1; di <= 1; ++di) {
                    var i = tile._go.i + di;
                    if (i < 0 || i >= bfW) continue;
                    var ci = (j)*bfW+(i);
                    if (this.board[ci]._wvs >= 0 && this.board[ci]._wvs < min) {
                        min = this.board[ci]._wvs;
                        result = this.board[ci];
                    }
                }
            }

            return result;
        }

        , _dealDamage: function(unit, target, value) {
            target._go.hp -= value;

            //animation-movesomewhere
            this._showTween(target._go.i, target._go.j, "-"+value, this.STYLE_TWEEN_DAMAGE);

            if (target._go.hp <= 0) {
                target._go.hp = 0;
                this._removeUnit(target);
            }
        }

        , _applyEffect: function(ability, unit, tile) {
            if (unit._go.effects[ability._name]) {
                unit._go.effects[ability._name].duration = ability.duration;
            } else {
                unit._go[ability.prop] += ability.value;
                unit._go.effects[ability._name] = {
                    proto: ability,
                    duration: ability.duration,
                    remove: function (unit, ability) {
                        unit._go[ability.prop] -= ability.value;
                        delete unit._go.effects[ability._name];
                    }
                };
            }
        }

        , _showTween: function(i, j, label, style) {
            var t = this.board._tile,
                x = t.ox + t.w/2 + i * (t.w + t.m),
                y = t.oy - j * (t.h + t.m);
            var text = game.add.text(x, y, label, style);
            text.anchor.set(0.5);
            var tween = game.add.tween(text).to( { y: y - 180, alpha: 0.5 }, 1000, Phaser.Easing.Quadratic.In, true);
            tween.onComplete.add(function() { text.destroy(); });
        }

        , _sqMouseOver: function(tile) {
            // hack to handle mouseout while pointer moves to external divs
            if (this._activeTile)
                this._sqMouseOut(this._activeTile);
            this._activeTile = tile;

            var unit = this.units[this._activeUnit];

            tile._tint_prev = tile.tint;
            if (tile._unit)
                UI.unitInfo.displayUnit(tile._unit, false);
            else
                UI.unitInfo.displayUnit(unit, true);

            this._activeAction.action = Action.NONE;
            // preparing action on click
            if (this._state === State.UNIT_ACT) {
                if (this._checkMove(unit, tile)) {
                    // unit can move here
                    tile.tint = this.TINT_ACTIVE;
                } else if (this._checkAttack(unit, tile)) {
                    // unit can attack here
                    tile.tint = this.TINT_ACTIVE;
                } else {
                    tile.tint = this.TINT_DISABLED;
                }
            } else if (this._state === State.UNIT_ABILITY) {
                if (this._checkAbility(unit, tile, this._activeAction.ability)) {
                    // unit can cast here
                    tile.tint = this.TINT_CAST;
                } else {
                    tile.tint = this.TINT_DISABLED;
                }
            }
        }

        , _sqMouseOut: function(tile) {
            tile.tint = tile._tint_prev ? tile._tint_prev : this.TINT_CLEAR;
            this._activeTile = null;
        }

        , _sqMouseDown: function(tile) {
            if (this._state === State.UNIT_ACT || this._state === State.UNIT_ABILITY) {
                if (this._executeAction()) {
                    this._activeAction.action = Action.NONE;
                    this._activeTile = null;

                    this._state = State.UNIT_SELECT;
                }
            }
        }

        , _abClick: function(name) {
            var ability = Domain.Data.Abilities[name];
            this._state = State.UNIT_ABILITY;
            this._activeAction.ability = ability;
        }

        , TINT_CLEAR    : 0xFFFFFF
        , TINT_ALLOWED  : 0x00A000
        , TINT_ACTIVE   : 0xF0F000
        , TINT_CAST     : 0x00F0F0
        , TINT_DISABLED : 0xA00000

        , STYLE_TWEEN_DAMAGE    : { font: "28px Arial", fill: "#b82b23", align: "center" }


        , _buildPathMap: function () {
            var bfW = this.board.W, bfH = this.board.H;

            var j, i, ci;
            for (j = 0; j < bfH; ++j) {
                for (i = 0; i < bfW; ++i) {
                    ci = (j)*bfW+(i);
                    this.board[ci]._wvs = this.board[ci]._unit ? -2 : -1;
                    this.board[ci].tint = this.board[ci]._tint_prev = this.TINT_CLEAR;
                }
            }
            var unit = this.units[this._activeUnit]._go;
            this.board[unit.j * this.board.W + unit.i]._wvs = 0;
            this.board[unit.j * this.board.W + unit.i].tint = this.TINT_ACTIVE;
            var speed = unit.speed;

            // обход
            var step = 0, maxSteps = Math.min(speed, bfW + bfH);
            while (step < maxSteps) {
                // распространение волны
                for (j = 0; j < bfH; ++j) {
                    for (i = 0; i < bfW; ++i) {
                        if (this.board[(j)*bfW+(i)]._wvs === step) {
                            ci = (j)*bfW+(i-1);
                            if (i - 1 >= 0 && this.board[ci]._wvs === -1) {
                                this.board[ci]._wvs = step + 1;
                                this.board[ci].tint = this.TINT_ALLOWED;
                            }
                            ci = (j-1)*bfW+(i);
                            if (j - 1 >= 0 && this.board[ci]._wvs === -1) {
                                this.board[ci]._wvs = step + 1;
                                this.board[ci].tint = this.TINT_ALLOWED;
                            }
                            ci = (j)*bfW+(i+1);
                            if (i + 1 < bfW && this.board[ci]._wvs === -1) {
                                this.board[ci]._wvs = step + 1;
                                this.board[ci].tint = this.TINT_ALLOWED;
                            }
                            ci = (j+1)*bfW+(i);
                            if (j + 1 < bfH && this.board[ci]._wvs === -1) {
                                this.board[ci]._wvs = step + 1;
                                this.board[ci].tint = this.TINT_ALLOWED;
                            }
                        }
                    }
                }
                // следующий шаг
                step += 1;
            }
        }

        , _battleOver: function() {
            for (var ci = 0; ci < this.board.length; ++ci) {
                this.board[ci].tint = this.TINT_ACTIVE;
            }
        }

        , update: function() {
            switch (this._state) {
                case State.UNIT_SELECT:
                    this._selectUnitToMove();
                    UI.unitInfo.displayUnit(this.units[this._activeUnit]);
                    break;
                case State.UNIT_ACT:
                    break;
                case State.ROUND_END:
                    this._activeUnit = -1;
                    this._updateUnitEffects();
                    this._state = State.UNIT_SELECT;
                    break;
                case State.BATTLE_OVER:
                    this._battleOver();
                    break;
            }
        }

        , _selectUnitToMove: function() {
            if (this._checkBattleOver())
                return;

            do {
                this._activeUnit += 1;
                if (this._activeUnit >= this.units.length) {
                    this._activeUnit = 0;
                    this._state = State.ROUND_END;
                    return;
                }
            } while (this.units[this._activeUnit]._go.hp <= 0);

            this._buildPathMap();
            this._state = State.UNIT_ACT;
        }

        , _checkBattleOver: function() {
            var u1 = 0, u2 = 0;
            var i;

            for (i = 0; i < this.units.length; ++i) {
                if (this.units[i]._go.hp > 0) {
                    if (this.units[i]._go.owner === 1)
                        u1 += 1;
                    else
                        u2 += 1;
                }
            }

            if (u1 === 0) {
                // player1 wina
                this._state = State.BATTLE_OVER;
                return true;
            } else if (u2 === 0) {
                // player2 wins
                this._state = State.BATTLE_OVER;
                return true;
            }

            return false;
        }

        , _updateUnitEffects: function() {
            for (var i = 0; i < this.units.length; ++i) {
                var unit = this.units[i];
                for(var key in unit._go.effects) {
                    var effect = unit._go.effects[key];
                    effect.duration -= 1;
                    if (effect.duration <= 0)
                        effect.remove(unit, effect.proto);
                }
            }
        }

    };

    // exports
    window.registerState("main", stateMain);

})();
