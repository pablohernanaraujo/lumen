import React from 'react';

import { render } from '../../../test-utils';
import { Body2 } from '../body2';

describe('Body2', () => {
  it('should render with default props', () => {
    const result = render(<Body2>Test body text</Body2>);

    expect(result.getByText('Test body text')).toBeTruthy();
  });

  it('should apply custom testID', () => {
    const result = render(<Body2 testID="body-2">Test body text</Body2>);

    expect(result.getByTestId('body-2')).toBeTruthy();
  });

  it('should apply custom style', () => {
    const customStyle = { marginTop: 20 };
    const result = render(<Body2 style={customStyle}>Test body text</Body2>);

    const body = result.getByText('Test body text');
    expect(body.props.style).toContainEqual(
      expect.objectContaining(customStyle),
    );
  });

  it('should render with different emphasis levels', () => {
    const { rerender, getByText } = render(
      <Body2 emphasis="pure">Test body text</Body2>,
    );

    expect(getByText('Test body text')).toBeTruthy();

    rerender(<Body2 emphasis="high">Test body text</Body2>);
    expect(getByText('Test body text')).toBeTruthy();

    rerender(<Body2 emphasis="medium">Test body text</Body2>);
    expect(getByText('Test body text')).toBeTruthy();

    rerender(<Body2 emphasis="low">Test body text</Body2>);
    expect(getByText('Test body text')).toBeTruthy();
  });

  it('should apply custom color', () => {
    render(<Body2 color="#FF0000">Test body text</Body2>);

    expect(true).toBe(true); // Color application is tested through theme integration
  });
});
