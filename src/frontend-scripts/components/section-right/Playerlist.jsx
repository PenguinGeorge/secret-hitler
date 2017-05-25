import React from 'react';
import { connect } from 'react-redux';
import { fetchProfile } from '../../actions/actions';
import cn from 'classnames';
import {ADMINS, PLAYERCOLORS} from '../../constants';

const
	mapStateToProps = ({ midSection }) => ({ midSection }),

	mapDispatchToProps = dispatch => ({
		fetchProfile: username => dispatch(fetchProfile(username))
	}),

	mergeProps = (stateProps, dispatchProps, ownProps) => {
		const
			userIsClickable = stateProps.midSection !== 'game',

			fetchProfile = username => {
				if (!userIsClickable) return;
				else dispatchProps.fetchProfile(username);
			};

		return Object.assign({}, ownProps, { userIsClickable, fetchProfile });
	};

class Playerlist extends React.Component {
	render() {
		return (
			<section className="playerlist">
				<div className="playerlist-header">
					<div className="clearfix">
						<h3 className="ui header">Lobby</h3>
						{(() => {
							if (Object.keys(this.props.userList).length) {
								return (
									<div>
										<span>{this.props.userList.list.length}</span>
										<i className="large user icon" />
										<span>{this.props.userList.totalSockets - this.props.userList.list.length >= 0 ? this.props.userList.totalSockets - this.props.userList.list.length : 0}</span>
										<i className="large unhide icon" />
									</div>
								);
							}
						})()}
					</div>
					<div className="ui divider" />
				</div>
				<div className="playerlist-body">
					{(() => {
						if (Object.keys(this.props.userList).length) {
							const {list} = this.props.userList;

							list.sort((a, b) => {
								const aTotal = a.wins + a.losses,
									bTotal = b.wins + b.losses;

								if (ADMINS.includes(a.userName)) {
									return -1;
								}

								if (ADMINS.includes(b.userName)) {
									return 1;
								}

								if (aTotal > 29 && bTotal > 29) {
									return (b.wins / bTotal) - (a.wins / aTotal);
								} else if (aTotal > 29) {
									return -1;
								} else if (bTotal > 29) {
									return 1;
								}

								return b.wins - a.wins;
							});

							return list.map((user, i) => {
								const percent = ((user.wins / (user.wins + user.losses)) * 100).toFixed(0),

									percentDisplay = (user.wins + user.losses) > 9 ? `${percent}%` : '',

									classes = cn(
										PLAYERCOLORS(user), 
										{ clickable: this.props.userIsClickable },
										'user'
									);

								return (
									<div key={i}>
										<span
											className={classes}
											onClick={this.props.fetchProfile.bind(null, user.userName)}>
											{user.userName}
										</span>
										<div className="userlist-stats-container">(
											<span className="userlist-stats">{user.wins}</span> / <span className="userlist-stats">{user.losses}</span>) <span className="userlist-stats"> {percentDisplay}</span>
										</div>
									</div>
								);
							});
						}
					})()}
				</div>
			</section>
		);
	}
}

Playerlist.propTypes = {
	userList: React.PropTypes.object
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)(Playerlist);