;(function() {

    var UI = window.UI || (window.UI = {});

    // class UnitWindow
    UI.unitInfo = {
        _MT: {}

        // jquery cached reference
        , $el: null
        // callback for dispatching clicks
        , _clickCallback: null

        , show: function() {
            this.$el = $("#unit_info");
            this.$el.draggable().show();
        }

        , hide: function() {
            this.$el.hide()
        }

        , setClickCallback: function(callback) {
            this._clickCallback = callback;
        }

        , _abilityButtonClicked: function() {
            var id = $(this).data("name");
            if (UI.unitInfo._clickCallback)
                UI.unitInfo._clickCallback(id);
        }

        , displayUnit: function(unit, active) {
            this.$el.find(".title").text(unit._go.type);
            this.$el.find(".hp").text(unit._go.hp + " / " + unit._go.proto.hp);
            this.$el.find(".speed").text(unit._go.speed + " / " + unit._go.proto.speed);
            this.$el.find(".attack").text(unit._go.proto.meleeAttack ? unit._go.meleeAttack : "-");
            this.$el.find(".mana").text(unit._go.proto.mana ? unit._go.mana + " / " + unit._go.proto.mana : "-");

            var $container = this.$el.find(".buttons").html("");
            if (active && unit._go.abilities) {
                for (var i = 0; i < unit._go.abilities.length; ++i) {
                    var ability = unit._go.abilities[i],
                        $button = $("<button>")
                            .addClass("ability-button")
                            .text(ability._name)
                            .attr("data-id", ability._id)
                            .attr("data-name", ability._name)
                            .click(this._abilityButtonClicked);
                    if (unit._go.mana < ability.mana)
                        $button.attr("disabled", "disabled");
                    $container.append($button);
                }
            }
        }

    };

})();
