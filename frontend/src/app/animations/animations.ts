import { trigger, transition, style, animate, query, stagger, keyframes } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-out', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ opacity: 0 }))
  ])
]);

export const slideInOut = trigger('slideInOut', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
  ])
]);

export const listStagger = trigger('listStagger', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger('80ms', [
        animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);

export const shakeAnimation = trigger('shake', [
  transition('* => shake', [
    animate('500ms', keyframes([
      style({ transform: 'translateX(0)', offset: 0 }),
      style({ transform: 'translateX(-10px)', offset: 0.15 }),
      style({ transform: 'translateX(10px)', offset: 0.3 }),
      style({ transform: 'translateX(-10px)', offset: 0.45 }),
      style({ transform: 'translateX(10px)', offset: 0.6 }),
      style({ transform: 'translateX(-10px)', offset: 0.75 }),
      style({ transform: 'translateX(0)', offset: 1.0 })
    ]))
  ])
]);

export const bounceInAnimation = trigger('bounceIn', [
  transition(':enter', [
    animate('600ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', keyframes([
      style({ opacity: 0, transform: 'scale3d(0.3, 0.3, 0.3)', offset: 0 }),
      style({ transform: 'scale3d(1.1, 1.1, 1.1)', offset: 0.4 }),
      style({ transform: 'scale3d(0.9, 0.9, 0.9)', offset: 0.6 }),
      style({ opacity: 1, transform: 'scale3d(1.03, 1.03, 1.03)', offset: 0.8 }),
      style({ transform: 'scale3d(1, 1, 1)', offset: 1 })
    ]))
  ])
]);
