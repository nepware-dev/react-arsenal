import React from 'react';

import styles from './styles.module.scss';
import type { TrapProps, TrapState } from './types';
import Button from '../Button';

class Trap extends React.Component<TrapProps, TrapState> {
    constructor(props: TrapProps) {
        super(props);
        this.state = { error: false, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.props.onCatchError && this.props.onCatchError(error, errorInfo);
        return this.setState({ error, errorInfo });
    }

    refreshPage = () => {
        window.location.reload();
    };

    render() {
        if (this.state.error) {
            return (
                <div className={styles.container}>
                    <h1>Something went wrong.</h1>
                    <p>Please be patient, we are currently trying to fix the problem.</p>
                    <p>In meanwhile you can refresh the page or wait a few minutes.</p>
                    <details className={styles.details}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo?.componentStack}
                    </details>
                    <Button className={styles.reloadButton} onClick={this.refreshPage}>
                        Click to reload!
                    </Button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default Trap;

export type { TrapProps } from './types';
