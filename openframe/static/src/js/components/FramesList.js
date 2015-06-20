var React = require('react'),
	Swiper = require('swiper'),
	FrameActions = require('../actions/FrameActions'),
    FrameStore = require('../stores/FrameStore'),
    _ = require('lodash');

var FramesList = React.createClass({
	getInitialState: function() {
        return {
			frames: [],
            currentFrame: {
                name: '',
                owner: ''
            }
		}
	},

	componentDidMount: function() {
		FrameActions.loadVisibleFrames();
		FrameStore.addChangeListener(this._onChange);
        this._updateContainerDimensions();
    },

    componentWillUnmount: function() {
        FrameStore.removeChangeListener(this._onChange);
    },

    componentDidUpdate: function() {
    },

    _initSlider: function() {
        var el = React.findDOMNode(this.refs.Swiper);
        this.swiper = new Swiper(el, {
            slidesPerView: 3,
            spaceBetween: 50,
            preloadImages: true,
            centeredSlides: true,
            freeMode: true,
            freeModeMomentum: true,
            freeModeMomentumRatio: .25,
            freeModeSticky:true,
            keyboardControl: true,
            onSlideChangeEnd: this._slideChangeEnd
        });


    },

    _populateSlider: function() {
        this.swiper.removeAllSlides();
        this.state.frames.forEach(this._addSlide);
    },

    _addSlide: function(frame) {
        var html = '' +
            '<div class="swiper-slide frame-slide" data-frameid="' + frame._id + '">' +
                '<img src=' + frame.current_content.url + ' />' +
            '</div>';

        this.swiper.appendSlide(html);
    },

    _slideTo: function(index) {
        this.swiper.slideTo(index);
    },

    _slideChangeEnd: function(slider) {
        var slide = this.swiper.slides[this.swiper.activeIndex],
            frame_id = slide.dataset.frameid;
        console.log('_slideChangeEnd', frame_id);
        FrameActions.slideChanged(frame_id);
    },

     _updateContainerDimensions: function() {
        var container = this.refs.container.getDOMNode(),
            h = container.offsetHeight,
            padding = 100,
            newH = h - padding;

        container.style.height = newH+'px';
        // container.style.top = '0px';
    },

  	_onChange: function() {
  		this.setState({
  			frames: FrameStore.getVisibleFrames(),
            currentFrame: FrameStore.getSelectedVisibleFrame()
  		});

  		// TODO: better React integration for the swiper

  		if (!this.swiper) {
  			this._initSlider();
  		    this._populateSlider()
            this.swiper.slideTo(0);
        }
  	},

    render: function() {
        var mirrored_by = '';

        if (this.state.currentFrame && _.isArray(this.state.currentFrame.mirrored_by)) {
            mirrored_by = (
                <div className="visible-frame-stats">
                    <span className="of-icon-mirror"></span> {this.state.currentFrame.mirrored_by.length}
                </div>
            )
        }
        return (
            <div>
                <div className="swiper-outer-container" ref="container">
                    <div className="swiper-container" ref="Swiper">
                        <div className="swiper-wrapper">

                        </div>
                    </div>
                </div>
                <div className="frame-slide-content">
                    <div className="visible-frame-details">
                        <div>
                            <span className="visible-frame-name">{this.state.currentFrame.name}</span>
                            <span className="visible-frame-user">@ {this.state.currentFrame.owner}</span>
                        </div>
                        {mirrored_by}
                    </div>
                </div>
            </div>
        );
    }

});

module.exports = FramesList;
