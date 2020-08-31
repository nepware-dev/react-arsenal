import React from 'react';
import PropType from 'prop-types';

import Button from '../Button';

import styles from './styles.module.scss';

class Trap extends React.Component {
    constructor(props) {
        super(props);
        this.state = { errror: false };
    }

    componentDidCatch(error, errorInfo) {
        return this.setState({ error, errorInfo });
    }

    refreshPage = () => {
        window. location. reload(false);
    }

    render() {
        if (this.state.error) {
            return (
                <div className={styles.container}>
                    <h1>Something went wrong.</h1>
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
