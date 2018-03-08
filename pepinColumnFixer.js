'use strict';

(function ($) {

    $.fn.pepinColFixer = (function() {

        var baseSettings = {
            baseClass: 'fixedCol-pepin',
        }
        
        var $tables = [];

        return {
            init: init
        }

        function init (e) {
            this.$tables = $('.fixedCol-pepin:not(.loaded)'); // reset $tables
            if(this.$tables.length == 0) return;

            this.$tables.each(this.initTables)
        };

        var clearTables = function() {
            $('.fixedCol-pepin.loaded').each(function(){
                var $table = $(this)
                    .removeClass('loaded')
                    .data('height', null);;
                var $wrap = $table.parents('.fixedCol-pepin-wrap');

                $wrap.after($table);
                $wrap.remove();
          })
        };

        var initTables = function() {
            var $table = $(this).addClass('loaded');

            if(!$table.find('thead').length || !$table.find('tbody').length) {
                // console.error('Make sure your FixedRows tables have a correct thead and tbody, please!');
                return;
            }

              // wrapper for all the tables
            var $wrap = $table.wrap('<div class="fixedCol-pepin-wrap"></div>').parent()
                .append('<div class="barX bar"><div class="barWrap"><div class="barInn"></div></div></div>')
                .append('<div class="barXBottom bar"><div class="barWrap"><div class="barInn"></div></div></div>')
                .append('<div class="barY bar"><div class="barWrap"><div class="barInn"></div></div></div>');

            $wrap.find('.barWrap')
                .mousedown(function(){ $(this).addClass('mouseDown'); })
                .mouseup(function(){ $(this).removeClass('mouseDown'); })
                .mousemove(pepinColFixer.clickBarEvt)
                .click(pepinColFixer.clickBarEvt);

                // The original table
            $table.wrap('<div class="fixedCol-pepin-fixHead"></diiv>');

                // table for the first column fix
            $wrap.append('<div class="fixedCol-pepin-fixCorner"><div class="fixedCol-pepin-fixCorner-inn"></div></div>')
                .find('.fixedCol-pepin-fixCorner-inn').append($table.clone());

                // table for the first row fix
            $wrap.prepend('<div class="fixedCol-pepin-scroller">')
                .find('.fixedCol-pepin-scroller')
                .on('scroll', pepinColFixer.scrollEvt)
                .append($table.clone());

                // tabla for the left top orner
            $wrap.prepend('<div class="fixedCol-pepin-fixCol"><div class="fixedCol-pepin-fixCol-inn">')
                .find('.fixedCol-pepin-fixCol-inn').append($table.clone());

            resize();
            
            $wrap.find('.fixedCol-pepin-scroller').scroll();
        };

        var resizeTables = function($wrap) {

            if(pepinColFixer.$tables.length) 
                pepinColFixer.$tables.each(function() {
                pepinColFixer.resizeTable($(this).parents('.fixedCol-pepin-wrap'))
            })

            pepinColFixer.scrollEvt();
        };

        var resizeTable = function($wrap) {
            var $table = $wrap.find('.fixedCol-pepin-fixHead table');

            var $scroller = $wrap.find('.fixedCol-pepin-scroller');
            var $tableLeft = $wrap.find('.fixedCol-pepin-fixCol');
            var $tableCorner = $wrap.find('.fixedCol-pepin-fixCorner');
            var $tableCol = $wrap.find('.fixedCol-pepin-fixHead');
            var $barX = $wrap.find('.barX');
            var $barXBottom = $wrap.find('.barXBottom');
            var $barY = $wrap.find('.barY');

                // calculate sizes
            var tableWidth = $table.outerWidth();
            var tableHeight = $table.data('height');

            var headHeight = $table.find('thead').height();
            var fixedColWidth = $table.find('tbody td:eq(0)').outerWidth();

            $scroller.css('height', tableHeight);

            $tableCol.css('height', headHeight);
            $tableCorner.css('height', headHeight);
            $tableLeft.show().css('width', fixedColWidth);
            $tableCorner.css('width', fixedColWidth);
            $barY.css('padding-top', headHeight);
            $barX.css({
                'padding-left': fixedColWidth,
                'top': headHeight
            });
            $barXBottom.css('padding-left', fixedColWidth);
            $tableLeft.find('.fixedCol-pepin-fixCol-inn').css('width', tableWidth);
            $tableCorner.find('.fixedCol-pepin-fixCorner-inn').css('width', tableWidth);

            if($table.width() > $wrap.width()) {
                $wrap.addClass('overFX');
                $scroller.css('margin-bottom',  -1 * ($scroller[0].offsetHeight - $scroller[0].clientHeight));

            } else {
                $wrap.removeClass('overFX');
                $scroller.css('margin-bottom', 0);
            }

            if($table.height() > $wrap.height()) {
                $wrap.addClass('overFY');
                $scroller.css('margin-right', -1 * ($scroller[0].offsetWidth - $scroller[0].clientWidth));

            } else {
                $wrap.removeClass('overFY');
                $scroller.css('margin-right', 0);
            }
        };

        var clickBarEvt = function(e) {
            var $bar = $(this);

            if(e.type == 'mousemove' && !$bar.hasClass('mouseDown')) return;

            var $wrap = $(this).parents('.fixedCol-pepin-wrap');
            var $scrollr = $wrap.find('.fixedCol-pepin-scroller');
            var $table = $wrap.find('.fixedCol-pepin-scroller table');

            if($bar.parent().hasClass('barX') || $bar.parent().hasClass('barXBottom')) {
                var scrollX = (e.pageX - $bar.offset().left) / $bar.width();
                $scrollr.scrollLeft(scrollX * ($table.width() - $wrap.width()));
            } else {
                var scrollY = (e.pageY - $bar.offset().top) / $bar.height();
                $scrollr.scrollTop(scrollY * ($table.height() - $wrap.height()));
            }

            return false;
        };

        var scrollEvt = function() { // event to sync scrolls

            var $wrap = $(this).parents('.fixedCol-pepin-wrap');
            var $table = $wrap.find('.fixedCol-pepin-fixHead table'); // the original table
            var $scroller = $wrap.find('.fixedCol-pepin-scroller');

            $wrap.find('.fixedCol-pepin-fixCol').scrollTop($scroller.scrollTop())
            $wrap.find('.fixedCol-pepin-fixHead').scrollLeft($scroller.scrollLeft())

            var $barX = $wrap.find('.barX, .barXBottom');
            var $barY = $wrap.find('.barY');

            var barYMaxH = $wrap.height() - $table.find('thead').height();
            var barYH = barYMaxH * $wrap.height() / $table.height();

            $barY.find('.barInn').css({
                height: barYH,
                top: (barYMaxH - barYH) * ($scroller.scrollTop() / ($table.height() - $wrap.height()))
            })

            var barXMaxW = $wrap.width() - $table.find('tbody td:eq(0)').outerWidth();
            var barXW = barXMaxW * $wrap.width() / $table.width();

            $barX.find('.barInn').css({
                width: barXW,
                left: (barXMaxW - barXW) * ($scroller.scrollLeft() / ($table.width() - $wrap.width()))
            })
        }
    })();

    console.log($.fn.pepinColFixer)

}(jQuery));