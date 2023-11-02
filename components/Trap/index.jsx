import React from 'react';

import Button from '../Button';

import styles from './styles.module.scss';

class Trap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {error: false};
    }

    componentDidCatch(error, errorInfo) {
        this.props.onCatchError && this.props.onCatchError(error, errorInfo);
        return this.setState({error, errorInfo});
    }

    refreshPage = () => {
        window.location.reload(false);
    }

    render() {
        if(this.state.error) {
            return (
                <div className={styles.container}>
                    <h1>Something went wrong.</h1>
                    <p>Please be patient, we are currently trying to fix the problem.</p>
                    <p>In meanwhile you can refresh the page or wait a few minutes.</p>
                    <details className={styles.details}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo.componentStack}
                    </details>
                    <Button className={styles.reloadButton} onClick={this.refreshPage}>Click to reload!</Button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default Trap;
