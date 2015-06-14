var React = require('react'),
    FrameActions = require('../actions/FrameActions');

var NavFrameLink = React.createClass({
	handleFrameSelection: function(e) {
		FrameActions.select(this.props.frame);
		if (this.props.linkClickHandler) {
			this.props.linkClickHandler();
		}
	},

	render: function() {
		var active = this.props.frame.active ? '*' : '';
		return (
			<li onTouchEnd={this.handleFrameSelection} onClick={this.handleFrameSelection}>
				<a href="#">{this.props.frame.name} {active}</a>
			</li>
		);
	}
});

module.exports = NavFrameLink;