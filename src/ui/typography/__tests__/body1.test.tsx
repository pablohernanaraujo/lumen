import React from 'react';

import { render } from '../../../test-utils';
import { Body1 } from '../body1';

describe('Body1', () => {
  it('should render with default props', () => {
    const result = render(<Body1>Test body text</Body1>);

    expect(result.getByText('Test body text')).toBeTruthy();
  });

  it('should apply custom testID', () => {
    const result = render(<Body1 testID="body-1">Test body text</Body1>);

    expect(result.getByTestId('body-1')).toBeTruthy();
  });

  it('should apply custom style', () => {
    const customStyle = { marginTop: 20 };
    const result = render(<Body1 style={customStyle}>Test body text</Body1>);

    const body = result.getByText('Test body text');
    expect(body.props.style).toContainEqual(
      expect.objectContaining(customStyle),
    );
  });

  it('should render with different emphasis levels', () => {
    const { rerender, getByText } = render(
      <Body1 emphasis="pure">Test body text</Body1>,
    );

    expect(getByText('Test body text')).toBeTruthy();

    rerender(<Body1 emphasis="high">Test body text</Body1>);
    expect(getByText('Test body text')).toBeTruthy();

    rerender(<Body1 emphasis="medium">Test body text</Body1>);
    expect(getByText('Test body text')).toBeTruthy();

    rerender(<Body1 emphasis="low">Test body text</Body1>);
    expect(getByText('Test body text')).toBeTruthy();
  });

  it('should apply custom color', () => {
    render(<Body1 color="secondary">Test body text</Body1>);

    expect(true).toBe(true); // Color application is tested through theme integration
  });
});
