import { Media, type MediaComponent } from './Media';
import { Image } from './Image';
import { Icon } from './Icon';

// Attach subcomponents
const CompMedia = Media as MediaComponent;

CompMedia.Image = Image;
CompMedia.Icon = Icon;

// export const CompMedia = Object.assign(Media, {
//     Image,
//     Icon,
// }) as MediaComponent;

export { CompMedia };
