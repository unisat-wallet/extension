import React from 'react';

import { Button } from '../Button';
import { Column } from '../Column';
import { Content } from '../Content';
import { Icon } from '../Icon';
import { Layout } from '../Layout';
import { Text } from '../Text';

export class ErrorBoundary extends React.Component {
  state: {
    hasError: boolean;
  } = {
    hasError: false
  };
  constructor(props) {
    super(props);
  }

  static getDerivedStateFromError(error) {
    console.log('getDerivedStateFromError', error);
    return { hasError: true, msg: error };
  }

  componentDidCatch(error, info) {
    console.log('catch error', error, info);
    this.setState({ hasError: true });
  }

  back = () => {
    try {
      window.location.href = 'index.html';
    } catch (e) {
      window.location.replace('index.html');
    }
  };

  refresh = () => {
    try {
      window.location.reload();
    } catch (e) {
      window.location.href = 'index.html';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Layout style={{ backgroundColor: '#000000' }}>
          <Content>
            <Column justifyCenter itemsCenter full gap="lg" style={{ padding: '20px' }}>
              <div style={{ marginTop: '40px' }}>
                <Icon icon="error-boundary" size={130} />
              </div>

              <Column gap="sm" itemsCenter style={{ marginTop: '10px', marginBottom: '20px' }}>
                <Text preset="title" text="Oops! Something went wrong." textCenter />
                <Text preset="regular" text="Try going back or refreshing." color="textDim" textCenter />
              </Column>

              <Column gap="md" fullX style={{ maxWidth: '400px' }}>
                <Button
                  preset="primary"
                  text="Go Back"
                  style={{
                    fill: 'var(--1, linear-gradient(104deg, #EBB94C 0%, #E97E00 100%))',
                    width: '280px',
                    height: '48px',
                    flexShrink: 0,
                    borderRadius: '12px',
                    marginBottom: '10px',
                    background: 'var(--1, linear-gradient(104deg, #EBB94C 0%, #E97E00 100%))'
                  }}
                  onClick={this.back}
                />
                <Button
                  preset="default"
                  text="Refresh Page"
                  style={{
                    borderRadius: '12px',
                    height: '48px',
                    width: '280px',
                    backgroundColor: '#262222',
                    borderColor: 'transparent'
                  }}
                  onClick={this.refresh}
                />
              </Column>
            </Column>
          </Content>
        </Layout>
      );
    }

    return (this.props as any).children;
  }
}
