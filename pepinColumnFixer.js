'use strict';

(function ($) {

    var pluginName = 'pepinColFixer';

    var defaults = {
        autoload: true,

        baseClass: 'pepinColFixer',
        blockAutoloadClass: 'pcf-not-auto',
        loadedClass: 'pcf-loaded',

            // TODO: use this and not hardcoded => css problem
        wrapClass: 'pcf-wrap'
    };

        // allow overwrite defaults options $.pepinColFixer(CustomOptions)
        // Do it before initialization any table (and before $.ready() foºr autoload) otherwise everything will broke
        // https://stackoverflow.com/questions/4901241/how-to-enable-global-settings-changes-in-jquery-plugin
    $.pepinColFixer = function(options) {
        $.extend(defaults, options);
    }

        // try autoload on document ready
    $(function(){
        if(!defaults.autoload) return;

        $('.' + defaults.baseClass + ':not(.' + defaults.blockAutoloadClass + ')').pepinColFixer();
    });

        // plugin structure based on https://stackoverflow.com/a/28396546
    $.fn.pepinColFixer = function(command, options) {

        return this.each(function () {
            
                // check for an existing instance associated to the element
            var instance = $.data(this, pluginName);

            if (instance) {
                if(instance[command]) instance[command].apply(this, options);
                else $.error('Method ' + options + ' does not exist on ' + pluginName);

            } else {
                var initialSettings = (command == 'init' && $.isPlainObject(options)) ? options :
                    ($.isPlainObject(command) ? command : null)

                    // intialize the instance
                var plugin = PepinColFixer(this, initialSettings);//new Plugin(this, options);

                    // Store the plugin instance on the element
                $.data(this, pluginName, plugin);
                
                return plugin;
            }
        });
    }

    function PepinColFixer (elm, initialSettings) {
        
        var $table = $(elm);

        if($table.hasClass(defaults.loadedClass)) {
            console.info(pluginName + ' instance already bootstraped. Exit!');
            return;
        }

        var $elms = initiateDOM(); // return reference to the elements in the widget

        var tableSettings = {
            width: $table.data('pcf-width') || $elms.wrap.outerWidth(),
            height: $table.data('pcf-height') || $elms.wrap.outerHeight(),
            colsFixed: parseInt($table.data('pcf-colsFixed')) || 1,
            rowsFixed: parseInt($table.data('pcf-rowsFixed')) || 1
        }

        $.extend(tableSettings, initialSettings);

        updateSize();
        $elms.scroller.scroll();

            // interface
        return {
            refresh: updateSize,
            revert: revert
        }


        function scrollEvt () { // sync scrolls

            $elms.fixCol.scrollTop($elms.scroller.scrollTop())
            $elms.fixHead.scrollLeft($elms.scroller.scrollLeft())

            var $barX = $elms.wrap.find('.barX, .barXBottom');
            var $barY = $elms.wrap.find('.pcf-barY');

            var barYMaxH = $elms.wrap.height() - $table.find('thead').height();
            var barYH = barYMaxH * $elms.wrap.height() / $table.height();

            $elms.barY.find('.pcf-barInn').css({
                height: barYH,
                top: (barYMaxH - barYH) * ($elms.scroller.scrollTop() / ($table.height() - $elms.wrap.height()))
            })

            var barXMaxW = $elms.wrap.width() - $table.find('tbody td:eq(0)').outerWidth();
            var barXW = barXMaxW * $elms.wrap.width() / $table.width();

            $elms.barX.add($elms.barXBottom).find('.pcf-barInn').css({
                width: barXW,
                left: (barXMaxW - barXW) * ($elms.scroller.scrollLeft() / ($table.width() - $elms.wrap.width()))
            })
        }

            // scrolblar event
        function clickBarEvt (e) {
            var $bar = $(this);

            if(e.type == 'mousemove' && !$bar.hasClass('mouseDown')) return;

            if($bar.parent().hasClass('pcf-barX') || $bar.parent().hasClass('pcf-barXBottom')) {
                var scrollX = (e.pageX - $bar.offset().left) / $bar.width();
                $elms.scroller.scrollLeft(scrollX * ($table.width() - $elms.wrap.width()));
            } else {
                var scrollY = (e.pageY - $bar.offset().top) / $bar.height();
                $elms.scroller.scrollTop(scrollY * ($table.height() - $elms.wrap.height()));
            }

            return false;
        };

            // create the required HTML and return it to easy access
        function initiateDOM () {
            $table.addClass(defaults.loadedClass);

              // wrapper for all the tables
            var $wrap = $table.wrap('<div class="pcf-wrap"></div>').parent()
                .append('<div class="pcf-barX pcf-bar"><div class="pcf-barWrap"><div class="pcf-barInn"></div></div></div>')
                .append('<div class="pcf-barXBottom pcf-bar"><div class="pcf-barWrap"><div class="pcf-barInn"></div></div></div>')
                .append('<div class="pcf-barY pcf-bar"><div class="pcf-barWrap"><div class="pcf-barInn"></div></div></div>');

            $wrap.find('.pcf-barWrap')
                .mousedown(function(){ $(this).addClass('mouseDown'); })
                .mouseup(function(){ $(this).removeClass('mouseDown'); })
                .mousemove(clickBarEvt)
                .click(clickBarEvt);

                // The original table => to enable 
           var $fixHead = $table.wrap('<div class="pcf-fixHead"></diiv>').parent();

                // table for the first column fix
            $wrap.append('<div class="pcf-fixCorner"><div class="pcf-fixCorner-inn"></div></div>')
                .find('.pcf-fixCorner-inn').append($table.clone());

                // table for the first row fix
            $wrap.prepend('<div class="pcf-scroller">')
                .find('.pcf-scroller')
                .on('scroll', scrollEvt)
                .append($table.clone());

                // tabla for the left top orner
            $wrap.prepend('<div class="pcf-fixCol"><div class="pcf-fixCol-inn">')
                .find('.pcf-fixCol-inn').append($table.clone());

            return {
                    // wraper
                wrap: $wrap,

                    // tables
                fixHead: $fixHead,
                scroller: $wrap.find('.pcf-scroller'),
                fixCol: $wrap.find('.pcf-fixCol'),
                fixCorner: $wrap.find('.pcf-fixCorner'),

                    // scroll bars
                barX: $wrap.find('.pcf-barX'),
                barXBottom: $wrap.find('.pcf-barXBottom'),
                barY: $wrap.find('.pcf-barY'),
            }
        }

            // reset the table to it's initial staet
        function revert() {
            $table.removeClass(defaults.loadedClass);

            var $wrap = $table.parents('.fixedCol-pepin-wrap');

            $wrap.after($table);
            $wrap.remove();
        };


        function updateSize($wrap) {

                // calculate sizes
            var tableWidth = tableSettings.width;
            var tableHeight = tableSettings.height;

            var headHeight = $table.find('thead').height(); /// TODO => fix th number of columns fro the settings
            console.log(headHeight)
            var fixedColWidth = $table.find('tbody td:eq(0)').outerWidth();

            $elms.wrap.css('width', tableWidth);
            $elms.wrap.css('height', tableHeight);
            $elms.scroller.css('height', tableHeight);

            $elms.fixHead.css('height', headHeight);
            $elms.fixCorner.css('height', headHeight);
            $elms.fixCol.show().css('width', fixedColWidth);
            $elms.fixCorner.css('width', fixedColWidth);
            $elms.barY.css('padding-top', headHeight);
            $elms.barX.css({
                'padding-left': fixedColWidth,
                'top': headHeight
            });
            $elms.barXBottom.css('padding-left', fixedColWidth);
            $elms.fixCol.find('.pcf-fixCol-inn').css('width', tableWidth);
            $elms.fixCorner.find('.pcf-fixCorner-inn').css('width', tableWidth);

            if($table.width() > $elms.wrap.width()) {
                $elms.wrap.addClass('overFX');
                $elms.scroller.css('margin-bottom',  -1 * ($elms.scroller[0].offsetHeight - $elms.scroller[0].clientHeight));

            } else {
                $elms.wrap.removeClass('overFX');
                $elms.scroller.css('margin-bottom', 0);
            }

            if($table.height() > $elms.wrap.height()) {
                $elms.wrap.addClass('overFY');
                $elms.scroller.css('margin-right', -1 * ($elms.scroller[0].offsetWidth - $elms.scroller[0].clientWidth));

            } else {
                $elms.wrap.removeClass('overFY');
                $elms.scroller.css('margin-right', 0);
            }
        };
    };


}(jQuery));