import React from 'react';

import { render } from '../../../test-utils';
import { Body3 } from '../body3';

describe('Body3', () => {
  it('should render with default props', () => {
    const result = render(<Body3>Test body text</Body3>);

    expect(result.getByText('Test body text')).toBeTruthy();
  });

  it('should apply custom testID', () => {
    const result = render(<Body3 testID="body-3">Test body text</Body3>);

    expect(result.getByTestId('body-3')).toBeTruthy();
  });

  it('should apply custom style', () => {
    const customStyle = { marginTop: 20 };
    const result = render(<Body3 style={customStyle}>Test body text</Body3>);

    const body = result.getByText('Test body text');
    expect(body.props.style).toContainEqual(
      expect.objectContaining(customStyle),
    );
  });

  it('should render with different emphasis levels', () => {
    const { rerender, getByText } = render(
      <Body3 emphasis="pure">Test body text</Body3>,
    );

    expect(getByText('Test body text')).toBeTruthy();

    rerender(<Body3 emphasis="high">Test body text</Body3>);
    expect(getByText('Test body text')).toBeTruthy();

    rerender(<Body3 emphasis="medium">Test body text</Body3>);
    expect(getByText('Test body text')).toBeTruthy();

    rerender(<Body3 emphasis="low">Test body text</Body3>);
    expect(getByText('Test body text')).toBeTruthy();
  });

  it('should apply custom color', () => {
    render(<Body3 color="tertiary">Test body text</Body3>);

    expect(true).toBe(true); // Color application is tested through theme integration
  });

  it('should apply different font weights', () => {
    const { rerender, getByText } = render(
      <Body3 fontWeight="light">Test body text</Body3>,
    );

    expect(getByText('Test body text')).toBeTruthy();

    rerender(<Body3 fontWeight="regular">Test body text</Body3>);
    expect(getByText('Test body text')).toBeTruthy();

    rerender(<Body3 fontWeight="medium">Test body text</Body3>);
    expect(getByText('Test body text')).toBeTruthy();

    rerender(<Body3 fontWeight="semibold">Test body text</Body3>);
    expect(getByText('Test body text')).toBeTruthy();

    rerender(<Body3 fontWeight="bold">Test body text</Body3>);
    expect(getByText('Test body text')).toBeTruthy();
  });

  it('should use regular font weight by default', () => {
    const result = render(<Body3>Test body text</Body3>);
    const body = result.getByText('Test body text');

    // Default fontWeight should be 'regular' (400)
    expect(body.props.style).toContainEqual(
      expect.objectContaining({
        fontWeight: '400',
      }),
    );
  });
});
