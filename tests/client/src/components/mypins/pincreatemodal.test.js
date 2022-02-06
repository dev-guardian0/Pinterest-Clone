/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import PinCreate from '../../../../../client/src/components/mypins/pincreatemodal';

jest.mock('../../../../../client/src/components/mypins/NO-IMAGE.png', () => 'load-error.png');

describe('The pin creation modal', () => {
  let props;
  beforeEach(() => {
    props = {
      userInfo: {
        authenticated: true,
        displayname: 'tester displayname',
        username: 'tester username',
        service: 'tester service',
        userId: 'tester user Id',
      },
      message: true,
      reset: jest.fn(),
      savePin: jest.fn(),
    };
  });
  afterEach(() => {
    props = null;
  });

  test('will render', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    wrapper.setState({ justMounted: false });
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will handle errors in images', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    wrapper.setState({ justMounted: false, isError: false });
    expect(wrapper.state().isError).toBe(false);
    const img = wrapper.find({ id: 'new-pin-image' });
    img.props().onError();
    expect(wrapper.state().isError).toBe(true);
  });

  test('will handle changes in description', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    wrapper.setState({ justMounted: false });
    const description = wrapper.find({ id: 'pin-description' });
    description.props().onChange({ target: { value: 'abc' } });
    expect(wrapper.state().description).toBe('abc');
  });

  test('will handle changes in image links', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    wrapper.setState({ justMounted: false });
    const imgLink = wrapper.find({ id: 'pin-img-link' });
    imgLink.props().onChange({ target: { value: 'https://abc.com' } });
    expect(wrapper.state().picPreview).toBe('https://abc.com');
  });

  test('will handle changes in image links with http', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    wrapper.setState({ justMounted: false });
    const imgLink = wrapper.find({ id: 'pin-img-link' });
    imgLink.props().onChange({ target: { value: 'http://abc.com' } });
    expect(wrapper.state().picPreview).toBe('https://abc.com');
  });

  test('will handle changes in image links with data protocol', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    wrapper.setState({ justMounted: false });
    const imgLink = wrapper.find({ id: 'pin-img-link' });
    imgLink.props().onChange({ target: { value: 'data:abc.com' } });
    expect(wrapper.state().picPreview).toBe('data:abc.com');
  });

  test('will handle changes in image links with invalid url', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    wrapper.setState({ justMounted: false });
    const imgLink = wrapper.find({ id: 'pin-img-link' });
    imgLink.props().onChange({ target: { value: 'htt://abc.com' } });
    expect(wrapper.state().picPreview).toBe('');
  });

  test('will save valid pins', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    wrapper.setState({
      justMounted: false,
      picPreview: 'https://abc.com',
      description: 'abcde',
      showErrorImage: false,
      show: true,
    });
    const SavePin = wrapper.find('SavePin');
    SavePin.props().savePic();
    expect(props.savePin).toHaveBeenCalledWith({
      owner: {
        name: 'tester displayname',
        service: 'tester service',
        id: 'tester user Id',
      },
      imgDescription: 'abcde',
      imgLink: 'https://abc.com',
    });
    expect(wrapper.state()).toMatchObject({
      show: false,
      picPreview: '',
      description: '',
    });
    expect(props.reset).toHaveBeenCalledTimes(1);
  });
});
