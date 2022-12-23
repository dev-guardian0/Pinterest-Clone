/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { PinZoom, StyledBadge } from '../../../../../client/src/components/modal/modalzoom';
import { pinsStub } from '../../../pinsStub';

jest.useFakeTimers();

describe('The pin zoom modal', () => {
  let props;
  const focus = jest.fn();
  beforeEach(() => {
    jest.spyOn(React, 'createRef').mockImplementation(() => ({
      current: {
        focus,
        clientHeight: 50,
        children: [{}, {
          clientHeight: 25,
        }],
      },
    }));
    global.scrollTo = jest.fn();
    props = {
      displayPinZoom: false,
      // [picobject, overlay button type, last scroll distance]
      zoomInfo: [pinsStub[0], 10],
      reset: jest.fn(),
      pinImage: jest.fn(),
      deletePin: null,
      handleNewComment: jest.fn(),
      user: { authenticated: true },
    };
  });

  afterEach(() => {
    props = null;
    focus.mockClear();
    global.scrollTo = null;
  });

  test('will render', () => {
    const wrapper = shallow(<PinZoom {...props} />);
    expect(focus).toHaveBeenCalled();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will not render if no image information', () => {
    const updatedProps = { ...props, zoomInfo: [] };
    const wrapper = shallow(<PinZoom {...updatedProps} />);
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  test('will keep the width of image if less than window\'s innerwidth', () => {
    global.innerWidth = 1000;
    global.innerHeight = 1000;
    const wrapper = shallow(<PinZoom {...props} />);
    wrapper.instance().handleImage({ target: { naturalWidth: 600, naturalHeight: 800 } });
    expect(wrapper.state().parentDivStyle).toEqual({
      top: 10,
      imgWidth: '622.5px',
      parentWidth: 622.5,
      pinnersSize: '2em',
      subTitleSize: '1.2em',
      titleSize: '2em',
      dateSize: '0.6em',
      width: '90%',
    });
  });

  test('will adjust the width of image if greater than window\'s innerwidth', () => {
    global.innerWidth = 1000;
    global.innerHeight = 1000;
    const wrapper = shallow(<PinZoom {...props} />);
    wrapper.instance().handleImage({ target: { naturalWidth: 1200, naturalHeight: 800 } });
    expect(wrapper.state().parentDivStyle).toEqual({
      top: 10,
      imgWidth: '980px',
      pinnersSize: '2em',
      subTitleSize: '1.2em',
      titleSize: '2em',
      dateSize: '0.6em',
      parentWidth: 980,
      width: '90%',
    });
  });

  test('will adjust the width of image if height is greater than window\'s innerheight', () => {
    global.innerWidth = 1000;
    global.innerHeight = 1000;
    const wrapper = shallow(<PinZoom {...props} />);
    wrapper.instance().handleImage({ target: { naturalWidth: 600, naturalHeight: 1200 } });
    expect(wrapper.state().parentDivStyle).toEqual({
      top: 10,
      imgWidth: '415px',
      pinnersSize: '2em',
      subTitleSize: '0.9em',
      titleSize: '1.2em',
      dateSize: '0.45em',
      parentWidth: 500,
      width: '90%',
    });
  });

  test('will close the zoom window on blur', async () => {
    const wrapper = shallow(<PinZoom {...props} />);
    const zoomCard = wrapper.find({ className: 'zoom cshow' });
    wrapper.setState({ firstShow: false });
    zoomCard.props().onBlur();
    jest.advanceTimersByTime(500);
    await Promise.resolve();

    expect(wrapper.state().show).toBe(false);
    expect(props.reset).toHaveBeenCalledTimes(1);
  });

  test('will disable the scroll', () => {
    global.scrollTo = jest.fn();
    shallow(<PinZoom {...props} />);
    expect(global.scrollTo).toHaveBeenCalledWith(0, 10);
  });

  test('will toggle the comments window', () => {
    const wrapper = shallow(<PinZoom {...props} />);
    // set image props
    wrapper.instance().handleImage({ target: { naturalWidth: 600, naturalHeight: 600 } });
    // toggle comment on
    const commentIcon = wrapper.find('ForwardRef(CardHeader)')
      .props()
      .action
      .props
      .children[0]
      .props
      .children
      .props;
    commentIcon.onClick();
    commentIcon.onMouseDown({ preventDefault: jest.fn() });
    expect(wrapper.state().commentsShowing).toEqual({ height: 955, width: 830 });
    expect(wrapper.state().cancelBlur).toEqual(true);
    // toggle comment off
    commentIcon.onClick();
    expect(wrapper.state().commentsShowing).toEqual(null);
    expect(wrapper.state().cancelBlur).toEqual(false);
  });

  test('will force close the comments window', () => {
    const wrapper = shallow(<PinZoom {...props} />);
    // set image props
    wrapper.instance().handleImage({ target: { naturalWidth: 600, naturalHeight: 600 } });
    // toggle comment on
    const commentIcon = wrapper.find('ForwardRef(CardHeader)')
      .props()
      .action
      .props
      .children[0]
      .props
      .children
      .props;
    commentIcon.onClick();
    const commentsWindow = wrapper.find('Comments');
    expect(wrapper.state().show).toBe(true);
    commentsWindow.props().closePin();
    expect(wrapper.state().show).toBe(false);
  });

  test('will not close the comments window if blur is not cancelled', () => {
    const wrapper = shallow(<PinZoom {...props} />);
    // set image props
    wrapper.instance().handleImage({ target: { naturalWidth: 600, naturalHeight: 600 } });
    // toggle comment on
    const commentIcon = wrapper.find('ForwardRef(CardHeader)')
      .props()
      .action
      .props
      .children[0]
      .props
      .children
      .props;
    // show comments div
    commentIcon.onClick();
    wrapper.setState({ cancelBlur: true });
    expect(wrapper.state().show).toBe(true);
    wrapper.instance().close();
    expect(wrapper.state().show).toBe(true);
  });

  test('will set zero on badge content for pins icon if savedby is not defined', () => {
    const updatedProps = {
      ...props,
      zoomInfo: [
        {
          ...pinsStub[0],
          savedBy: undefined,
        },
        10,
      ],
    };
    const wrapper = shallow(<PinZoom {...updatedProps} />);
    // toggle comment on
    const pinsIcon = wrapper.find('ForwardRef(CardHeader)')
      .props()
      .action
      .props
      .children[1]
      .props;
    expect(pinsIcon.badgeContent).toBe(0);
  });

  test('will enable scroll on unmount', () => {
    const wrapper = shallow(<PinZoom {...props} />);
    expect(document.body.style.overflowY).toBe('hidden');
    wrapper.instance().componentWillUnmount();
    expect(document.body.style.overflowY).toBe('scroll');
  });
});

describe('The styled badge', () => {
  test('Will render for pins', () => {
    const badge = shallow(<StyledBadge name="pin" />);
    expect(toJson(badge)).toMatchSnapshot();
  });

  test('Will render for comments', () => {
    const badge = shallow(<StyledBadge name="comments" />);
    expect(toJson(badge)).toMatchSnapshot();
  });
});
