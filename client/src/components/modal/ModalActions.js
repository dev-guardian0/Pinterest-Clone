import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Tooltip from '@mui/material/Tooltip';

function GetAction({
  element, pinImage, deletePin, reset,
}) {
  if (!pinImage) { // means called from profile page
    return (
      <IconButton
        aria-label="settings"
        style={{ margin: '1vh' }}
        onClick={() => {
          deletePin(element);
          reset();
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        {
          element.owns
            ? (
              <Tooltip title="Permanently delete image" placement="bottom">
                <DeleteForeverIcon style={{ fontSize: '2em', color: '#d12929' }} />
              </Tooltip>
            ) : (
              <Tooltip title="Unpin image" placement="bottom">
                <PushPinIcon style={{ fontSize: '2em', color: '#3a1c1cde' }} />
              </Tooltip>
            )
        }
      </IconButton>
    );
  }

  // finds the status of image to determine what kind of pin to place on image
  if (element.hasSaved || element.owns) { // If the user has already saved this pin
    return (
      <IconButton
        aria-label="settings"
        style={{ margin: '1vh' }}
        disableRipple={element.owns}
        onClick={element.hasSaved ? () => { pinImage(element); } : null}
        onMouseDown={(e) => e.preventDefault()}
      >
        <Tooltip title={element.owns ? 'You own this image' : 'Unpin this image'} placement="bottom">
          <PushPinIcon style={{ fontSize: '2em', color: element.owns ? '#c50000' : '#3a1c1cde' }} />
        </Tooltip>
      </IconButton>
    ); // no button
  }
  // user has not saved this pin show outlined pin
  return (
    <IconButton
      aria-label="settings"
      style={{ margin: '1vh' }}
      onClick={() => {
        pinImage(element);
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <Tooltip title="Pin image" placement="bottom">
        <PushPinOutlinedIcon style={{ fontSize: '2em' }} />
      </Tooltip>
    </IconButton>
  );
}

export default GetAction;

GetAction.defaultProps = {
  pinImage: null,
  deletePin: null,
};

GetAction.propTypes = {
  element: PropTypes.objectOf(PropTypes.shape).isRequired,
  // what type of button to place on pic/thumbnail executed by caller
  pinImage: PropTypes.func,
  deletePin: PropTypes.func,
  reset: PropTypes.func.isRequired,
};
